
module.exports.routes = {



  '/': { view: 'pages/homepage' },
  'GET /api/ping': { action: 'ping' },
  'GET /products':    { action: 'product/find' },
  'GET /products/:id':{ action: 'product/findOne' },
  'POST /products':   { action: 'product/create' },
  'PUT /products/:id':{ action: 'product/update' },
  'DELETE /products/:id': { action: 'product/destroy' },

};
