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
    
    // Log only essential information
    return client;
  } catch (error) {
    sails.log.error('❌ Failed to create Elasticsearch sync client:', error);
    return null;
  }
};

/**
 * Process the sync queue
 */
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
    // Put failed operation back in the queue
    if (syncQueue.length > 0) {
      syncQueue.unshift(syncQueue[0]);
    }
    scheduleRetry();
  } finally {
    processingQueue = false;
    
    // Continue processing if there are more items
    if (syncQueue.length > 0) {
      setTimeout(processQueue, 100);
    }
  }
};

/**
 * Check if Elasticsearch is available
 */
const checkElasticsearchAvailability = async () => {
  try {
    const result = await client.ping();
    return !!result;
  } catch (error) {
    sails.log.error('Elasticsearch is not available:', error.message);
    return false;
  }
};

/**
 * Schedule a retry after failure
 */
const scheduleRetry = () => {
  if (retryTimeout) clearTimeout(retryTimeout);
  
  // Retry after 30 seconds
  retryTimeout = setTimeout(() => {
    sails.log.info('Retrying Elasticsearch sync...');
    processQueue();
  }, 30000);
};  /**
   * Index a document in Elasticsearch
   */
  const indexDocument = async (model, data) => {
    try {
      // Only process Product model
      if (model !== 'Product') {
        sails.log.warn(`Skipping indexing for non-Product model: ${model}`);
        return;
      }
      
      const indexName = 'products';
      
      // Check if index exists, create if not
      const indexExists = await client.indices.exists({ index: indexName });
      
      if (!indexExists.body) {
        // Create index with Product mappings and custom analyzer
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
              image: { type: 'text', index: false }, // Don't index the image URL for search
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
      
      // Index the document
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
  };  /**
   * Delete a document from Elasticsearch
   */
  const deleteDocument = async (model, id) => {
    try {
      // Only process Product model
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
  /**
   * Initialize the service
   */
  initialize: async function() {
    client = initializeClient();
    
    // Process any queued operations that might have accumulated
    // during system startup
    processQueue();
  },
  
  /**
   * Add an item to the sync queue
   */
  queueOperation: function(operation, model, data) {
    syncQueue.push({ operation, model, data });
    processQueue();
  },
  
  /**
   * Sync all products
   */
  syncAll: async function(model) {
    try {
      // Only allow syncing Products
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
  
  /**
   * Check sync status
   */
  getStatus: function() {
    return {
      queueLength: syncQueue.length,
      processingQueue,
      elasticsearchAvailable: client && !client.isClosed()
    };
  },
  
  /**
   * Reset sync service
   */
  reset: function() {
    syncQueue = [];
    if (retryTimeout) clearTimeout(retryTimeout);
    processingQueue = false;
    
    if (client && !client.isClosed()) {
      client.close();
    }
    
    client = initializeClient();
  },
  
  /**
   * Rebuild the Elasticsearch index from scratch
   */
  rebuildIndex: async function() {
    try {
      // Delete the index if it exists
      const indexExists = await client.indices.exists({ index: 'products' });
      
      if (indexExists.body) {
        sails.log.info('Deleting existing products index...');
        await client.indices.delete({ index: 'products' });
      }
      
      // Create the index with proper mappings
      sails.log.info('Creating new products index with proper mappings...');
      
      const indexSettings = {
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
        index: 'products',
        body: indexSettings
      });
      
      sails.log.info('Products index created successfully');
      
      // Reindex all products
      const products = await sails.models.product.find();
      sails.log.info(`Reindexing ${products.length} products...`);
      
      for (const product of products) {
        await client.index({
          index: 'products',
          id: product.id,
          body: product,
          refresh: true
        });
      }
      
      sails.log.info('All products have been reindexed successfully');
      return { success: true, count: products.length };
    } catch (error) {
      sails.log.error('Error rebuilding index:', error);
      return { success: false, error: error.message };
    }
  }
};
