/**
 * test-elasticsearch.js
 * 
 * A simple script to test Elasticsearch connection and synchronization
 */

// Set up Sails app to run without lifting the server
const sails = require('sails');
const { exit } = require('process');

sails.load({
  hooks: {
    grunt: false,
    http: false,
    sockets: false,
    pubsub: false,
    views: false
  },
  log: {
    level: 'info'
  }
}, async (err) => {
  if (err) {
    console.error('Error loading Sails app:', err);
    return exit(1);
  }
  
  console.log('Sails app loaded successfully');
  
  try {
    const { Client } = require('@elastic/elasticsearch');
    const client = new Client({
      node: 'http://localhost:9200',
      pingTimeout: 3000
    });
    
    console.log('Testing Elasticsearch connection...');
    const pingResult = await client.ping();
    console.log('Elasticsearch ping result:', pingResult.body);
    
    console.log('Checking indices...');
    const indices = await client.cat.indices({ format: 'json' });
    console.log('Indices:', indices.body);
    
    // Check if products index exists
    const productsExists = await client.indices.exists({ index: 'products' });
    console.log('Products index exists:', productsExists.body);
    
    if (!productsExists.body) {
      console.log('Creating products index...');
      await client.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              name: { type: 'text' },
              price: { type: 'float' },
              image: { type: 'text' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' }
            }
          }
        }
      });
      console.log('Products index created successfully');
    }
    
    // Test syncing a product
    console.log('Testing product sync...');
    
    // Get count of products in MongoDB
    const mongoCount = await sails.models.product.count();
    console.log(`MongoDB products count: ${mongoCount}`);
    
    // Get count of products in Elasticsearch      const esCountResponse = await client.count({ index: 'products' });
      const esCount = esCountResponse.body.count;
      console.log(`Elasticsearch products count: ${esCount}`);
      
      if (mongoCount !== esCount) {
        console.log('Counts don\'t match, rebuilding index...');
        const rebuildResult = await sails.services.elasticsearchsync.rebuildIndex();
        console.log('Rebuild result:', rebuildResult);
        
        // Check counts again
        const esCountAfterResponse = await client.count({ index: 'products' });
        const esCountAfter = esCountAfterResponse.body.count;
        console.log(`Elasticsearch products count after rebuild: ${esCountAfter}`);
      } else {
        console.log('MongoDB and Elasticsearch products count match!');
      }
    
    console.log('Testing search functionality...');
    
    // Test search with "TV"
    const searchTvResults = await client.search({
      index: 'products',
      body: {
        query: {
          multi_match: {
            query: 'TV',
            fields: ['name^2', 'image'],
            type: 'phrase_prefix'
          }
        }
      }
    });
    
    console.log('Search results for "TV":', JSON.stringify(searchTvResults.body.hits, null, 2));
    
    // Test search with "Smart"
    const searchSmartResults = await client.search({
      index: 'products',
      body: {
        query: {
          multi_match: {
            query: 'Smart',
            fields: ['name^2', 'image'],
            type: 'phrase_prefix'
          }
        }
      }
    });
    
    console.log('Search results for "Smart":', JSON.stringify(searchSmartResults.body.hits, null, 2));
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    sails.lower();
    exit(0);
  }
});
