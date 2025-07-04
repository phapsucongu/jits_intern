
module.exports.routes = {



  '/': { view: 'pages/homepage' },
  'GET /api/ping': { action: 'ping' },
  'GET /products':    { action: 'product/find' },
  'GET /products/:id':{ action: 'product/findOne' },
  'POST /products':   { action: 'product/create' },
  'PUT /products/:id':{ action: 'product/update' },
  'DELETE /products/:id': { action: 'product/destroy' },

  'POST /api/register': 'UsersController.register',
  'POST /api/login': 'UsersController.login',
  'GET /api/auth/products': {
    controller: 'ProductController',
    action: 'find'
  },
  'GET /api/auth/products/:id': {
    controller: 'ProductController',
    action: 'findOne'
  },
  'POST /api/auth/products': {
    controller: 'ProductController',
    action: 'create',
    policy: 'isAuthenticated'
  },
  'PUT /api/auth/products/:id': {
    controller: 'ProductController',
    action: 'update',
    policy: 'isAuthenticated'
  },
  'DELETE /api/auth/products/:id': {
    controller: 'ProductController',
    action: 'destroy',
    policy: 'isAuthenticated'
  }
};
