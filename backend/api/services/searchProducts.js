const { Client } = require('@elastic/elasticsearch');

let client;

// Tạo client Elasticsearch
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
  // Hàm khởi tạo được gọi khi Sails khởi động
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

  // Hàm tạo sản phẩm vào Elasticsearch
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

  // Hàm tìm kiếm sản phẩm theo từ khóa
  searchProducts: async ({ keyword, page = 1, limit = 10 }) => {
    try {
      if (!client) client = initializeClient();

      const from = (page - 1) * limit;

      const result = await client.search({
        index: 'products',
        from,
        size: limit,
        body: {
          query: {
            query_string: {
                query: `*${keyword || ''}*`,
                fields: ['name^2', 'image'],
                default_operator: 'AND',
                }
            }
        }
    });

      const hits = result.body?.hits?.hits.map(hit => hit._source) || [];
      const total = typeof result.body?.hits?.total === 'object'
        ? result.body.hits.total.value
        : result.body?.hits?.total || 0;

      return { results: hits, total };
    } catch (error) {
      sails?.log?.error?.('❌ Elasticsearch search error:', error);
      return { results: [], total: 0, error: error.message };
    }
  }
};
