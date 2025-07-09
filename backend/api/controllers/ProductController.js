const searchProducts = require('../services/searchProducts');

module.exports = {
  // Lưu vào MongoDB và cố gắng đưa vào ES (nếu có thể)
  create: async (req, res) => {
    try {
      sails.log.info('Creating product with data:', req.body);
      
      if (!req.body.name || !req.body.price) {
        return res.badRequest({ error: 'Name and price are required fields.' });
      }

      const product = await Product.create(req.body).fetch();
      sails.log.info(`Product created successfully in MongoDB with ID: ${product.id}`);
      let esSuccess = false;
      let esError = null;
      
      try {
        const { Client } = require('@elastic/elasticsearch');
        const client = new Client({ 
          node: 'http://localhost:9200',
          pingTimeout: 1000 // Quick timeout
        });
        
        const pingResult = await client.ping();
        
        if (pingResult) {
          await searchProducts.indexProduct(product);
          esSuccess = true;
        }
      } catch (error) {
        esError = error;
        sails.log.error('Elasticsearch is not available or indexing failed:', error.message);
      }
      return res.status(201).json({
        ...product,
        _meta: {
          elasticsearchIndexed: esSuccess,
          elasticsearchError: esError ? esError.message : null
        }
      });
    } catch (error) {
      sails.log.error('Error creating product:', error);
      return res.serverError({ error: 'Failed to create product', details: error.message });
    }
  },


  search: async (req, res) => {
    const { keyword, page, limit } = req.query;
    const result = await searchProducts.searchProducts({ keyword, page, limit });
    return res.json(result);
  },
  
  
};
