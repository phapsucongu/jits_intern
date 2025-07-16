const { Client } = require('@elastic/elasticsearch');

let client;

const initializeClient = () => {
  try {
    client = new Client({
      node: 'http://localhost:9200',
      pingTimeout: 3000,
      apiVersion: '7.x',
      compatibility: '7'
    });

    sails?.log?.info?.('✅ Elasticsearch client initialized');
    return client;
  } catch (error) {
    sails?.log?.error?.('❌ Failed to create Elasticsearch client:', error);
    return null;
  }
};

module.exports = {
  initialize: async function () {
    client = initializeClient();

    try {
      const exists = await client.indices.exists({ index: 'products' });
      if (!exists.body) {
        await client.indices.create({
          index: 'products',
          body: {
            mappings: {
              properties: {
                name: { type: 'text' },
                price: { type: 'float' },
                image: { type: 'text' },
              }
            }
          }
        });
        sails?.log?.info?.('✅ Created index: products');
      }
    } catch (error) {
      sails?.log?.error?.('❌ Error initializing Elasticsearch index:', error);
    }
  },

  indexProduct: async (product) => {
    try {
      if (!client) client = initializeClient();

      const result = await client.index({
        index: 'products',
        id: product.id,
        body: {
          name: product.name,
          price: product.price,
          image: product.image,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
        refresh: true,
      });

      sails?.log?.info?.(`✅ Product indexed: ${product.id}`);
      return result;
    } catch (error) {
      sails?.log?.error?.('❌ Elasticsearch indexing error:', error);
      throw error;
    }
  },

  searchProducts: async ({ keyword, page = 1, limit = 10 }) => {
    try {
      if (!client) client = initializeClient();

      // Convert to integers to ensure proper calculation
      page = parseInt(page, 10) || 1;
      limit = parseInt(limit, 10) || 10;
      const from = (page - 1) * limit;
      
      let searchQuery;
      
      if (!keyword) {
        searchQuery = { match_all: {} };
      } else {
        searchQuery = {
          bool: {
            should: [
              // Match exact prefix (e.g., "phone" matches "phone case")
              {
                match_phrase_prefix: {
                  name: {
                    query: keyword,
                    slop: 0,
                    boost: 3.0 // Higher boost for exact matches
                  }
                }
              },
              // Match words containing the keyword (e.g., "phone" matches "smartphone")
              {
                wildcard: {
                  name: {
                    value: `*${keyword}*`,
                    boost: 1.0
                  }
                }
              },
              // Match terms that sound similar
              {
                fuzzy: {
                  name: {
                    value: keyword,
                    fuzziness: "AUTO",
                    boost: 0.5
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        };
      }
      
      const result = await client.search({
        index: 'products',
        from,
        size: limit,
        body: {
          query: searchQuery
        }
    });

      const hits = result.body?.hits?.hits.map(hit => {
        // Merge _id with _source for consistent ID handling
        return { id: hit._id, ...hit._source };
      }) || [];
      
      const total = typeof result.body?.hits?.total === 'object'
        ? result.body.hits.total.value
        : result.body?.hits?.total || 0;
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      
      return { 
        results: hits, 
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        } 
      };
    } catch (error) {
      sails?.log?.error?.('❌ Elasticsearch search error:', error);
      // Provide more descriptive error information for debugging
      const errorInfo = {
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
        code: error.code || 'UNKNOWN_ERROR',
        statusCode: error.statusCode || 500
      };
      
      sails?.log?.debug?.('Search error details:', errorInfo);
      
      return { 
        results: [], 
        pagination: {
          total: 0,
          page: parseInt(page, 10) || 1,
          limit: parseInt(limit, 10) || 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        error: errorInfo
      };
    }
  }
};
