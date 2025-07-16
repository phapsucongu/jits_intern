const searchProducts = require('../services/searchProducts');

module.exports = {
  // Lưu vào MongoDB và cố gắng đưa vào ES (nếu có thể)
  create: async (req, res) => {
    try {
      // Skip verbose logging
      
      if (!req.body.name || !req.body.price) {
        return res.badRequest({ error: 'Name and price are required fields.' });
      }

      const product = await Product.create(req.body).fetch();
      // Skip verbose logging
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
    // Map the name parameter to keyword for searchProducts
    const { name, page, limit } = req.query;
    const keyword = name; // Use the name parameter as the keyword
    
    const result = await searchProducts.searchProducts({ 
      keyword, 
      page: parseInt(page, 10) || 1, 
      limit: parseInt(limit, 10) || 10 
    });
    
    return res.json(result);
  },
  
  // New endpoint specifically for paginated results
  paginate: async (req, res) => {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;
      
      // Log the request parameters for debugging
      sails.log.info('Paginate request:', { keyword, page, limit });
      
      const result = await searchProducts.searchProducts({ 
        keyword, 
        page: parseInt(page, 10) || 1, 
        limit: parseInt(limit, 10) || 10 
      });
      
      return res.json(result);
    } catch (error) {
      sails.log.error('Error in paginate:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch paginated products',
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  }
};
