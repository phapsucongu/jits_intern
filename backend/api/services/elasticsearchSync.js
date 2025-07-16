/**
 * elasticsearchSync.js
 * 
 * @description :: Service to handle synchronization between MongoDB and Elasticsearch
 */

const { Client } = require('@elastic/elasticsearch');

let client;
let syncQueue = [];
let processingQueue = false;
let retryTimeout;

/**
 * Initialize the Elasticsearch client
 */
const initializeClient = () => {
  try {
    client = new Client({
      node: 'http://localhost:9200',
      pingTimeout: 3000,
      apiVersion: '7.x',
      compatibility: '7'
    });

    return client;
  } catch (error) {
    sails.log.error('❌ Failed to create Elasticsearch sync client:', error);
    return null;
  }
};

const processQueue = async () => {
  if (processingQueue || syncQueue.length === 0) return;
  
  processingQueue = true;
  
  try {
    if (!client) client = initializeClient();
    
    // Check if Elasticsearch is available
    const isAvailable = await checkElasticsearchAvailability();
    if (!isAvailable) {
      processingQueue = false;
      scheduleRetry();
      return;
    }
    
    const currentItem = syncQueue.shift();
    
    if (currentItem) {
      const { operation, model, data } = currentItem;
      
      switch (operation) {
        case 'create':
        case 'update':
          await indexDocument(model, data);
          break;
        case 'delete':
          await deleteDocument(model, data.id);
          break;
        default:
          sails.log.warn(`Unknown operation: ${operation}`);
      }
    }
  } catch (error) {
    sails.log.error('Error processing Elasticsearch sync queue:', error);
    if (syncQueue.length > 0) {
      syncQueue.unshift(syncQueue[0]);
    }
    scheduleRetry();
  } finally {
    processingQueue = false;

    if (syncQueue.length > 0) {
      setTimeout(processQueue, 100);
    }
  }
};

const checkElasticsearchAvailability = async () => {
  try {
    const result = await client.ping();
    return !!result;
  } catch (error) {
    sails.log.error('Elasticsearch is not available:', error.message);
    return false;
  }
};

const scheduleRetry = () => {
  if (retryTimeout) clearTimeout(retryTimeout);

  retryTimeout = setTimeout(() => {
    sails.log.info('Retrying Elasticsearch sync...');
    processQueue();
  }, 30000);
};  
  const indexDocument = async (model, data) => {
    try {
      if (model !== 'Product') {
        sails.log.warn(`Skipping indexing for non-Product model: ${model}`);
        return;
      }
      
      const indexName = 'products';
      
      const indexExists = await client.indices.exists({ index: indexName });
      
      if (!indexExists.body) {
        const mappings = {
          settings: {
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: "custom",
                  tokenizer: "standard",
                  filter: ["lowercase"]
                }
              }
            }
          },
          mappings: {
            properties: {
              name: { 
                type: 'text',
                analyzer: "product_analyzer",
                search_analyzer: "product_analyzer"
              },
              price: { type: 'float' },
              image: { type: 'text', index: false }, 
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            }
          }
        };
        
        await client.indices.create({
          index: indexName,
          body: { mappings }
        });
        
        sails.log.info(`✅ Created index: ${indexName}`);
      }
      
      await client.index({
        index: indexName,
        id: data.id,
        body: data,
        refresh: true
      });
      
      sails.log.info(`✅ Product indexed: ${data.id}`);
    } catch (error) {
      sails.log.error(`❌ Error indexing Product:`, error);
      throw error;
    }
  };  
  const deleteDocument = async (model, id) => {
    try {
      if (model !== 'Product') {
        sails.log.warn(`Skipping deletion for non-Product model: ${model}`);
        return;
      }
      
      const indexName = 'products';
      
      await client.delete({
        index: indexName,
        id: id,
        refresh: true
      });
      
      sails.log.info(`✅ Product deleted from Elasticsearch: ${id}`);
    } catch (error) {
      // If document not found, consider it a success
      if (error.meta?.body?.result === 'not_found') {
        sails.log.info(`Product ${id} was already not in Elasticsearch`);
        return;
      }
      
      sails.log.error(`❌ Error deleting Product from Elasticsearch:`, error);
      throw error;
    }
  };

module.exports = {

  initialize: async function() {
    client = initializeClient();
    
    processQueue();
  },
  
  queueOperation: function(operation, model, data) {
    syncQueue.push({ operation, model, data });
    processQueue();
  },
  
  syncAll: async function(model) {
    try {
      if (model !== 'Product') {
        sails.log.warn(`Syncing non-Product models is not supported. Requested: ${model}`);
        return { success: false, error: 'Only Product model is supported for syncing' };
      }
      
      const productModel = sails.models.product;
      
      if (!productModel) {
        throw new Error('Product model not found');
      }
      
      const products = await productModel.find();
      sails.log.info(`Syncing all ${products.length} products to Elasticsearch`);
      
      for (const product of products) {
        this.queueOperation('create', 'Product', product);
      }
      
      return { success: true, count: products.length };
    } catch (error) {
      sails.log.error('Error syncing all products:', error);
      return { success: false, error: error.message };
    }
  },
  
};
