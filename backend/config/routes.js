
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
  },
  'PUT /api/auth/products/:id': {
    controller: 'ProductController',
    action: 'update',
  },
  'DELETE /api/auth/products/:id': {
    controller: 'ProductController',
    action: 'destroy',
  },

  'GET /api/search/products': {
    controller: 'ProductController',
    action: 'search',
  },
  
  'GET /api/paginate/products': {
    controller: 'ProductController',
    action: 'paginate',
  },
  
  'GET /api/auth/paginate/products': {
    controller: 'ProductController',
    action: 'paginate',
    policy: 'isAuthenticated'
  },
  
  'GET /api/auth/validate': {
    controller: 'UsersController',
    action: 'validate',
    policy: 'isAuthenticated'
  },
  
  // Add a simple version of the validate route for backward compatibility
  'GET /api/validate': {
    controller: 'UsersController',
    action: 'validate',
    policy: 'isAuthenticated'
  },
  
  // RBAC Routes
  
  // Permission routes
  'GET /api/auth/permissions': {
    controller: 'PermissionController',
    action: 'find',
    policy: 'isAuthenticated',
    permission: { resource: 'permission', action: 'view' }
  },
  'GET /api/auth/permissions/:id': {
    controller: 'PermissionController',
    action: 'findOne',
    policy: 'isAuthenticated',
    permission: { resource: 'permission', action: 'view' }
  },
  'POST /api/auth/permissions': {
    controller: 'PermissionController',
    action: 'create',
    policy: 'isAuthenticated',
    permission: { resource: 'permission', action: 'create' }
  },
  'PUT /api/auth/permissions/:id': {
    controller: 'PermissionController',
    action: 'update',
    policy: 'isAuthenticated',
    permission: { resource: 'permission', action: 'edit' }
  },
  'DELETE /api/auth/permissions/:id': {
    controller: 'PermissionController',
    action: 'delete',
    policy: 'isAuthenticated',
    permission: { resource: 'permission', action: 'delete' }
  },
  
  // Role routes
  'GET /api/auth/roles': {
    controller: 'RoleController',
    action: 'find',
    policy: 'isAuthenticated',
    permission: { resource: 'role', action: 'view' }
  },
  'GET /api/auth/roles/:id': {
    controller: 'RoleController',
    action: 'findOne',
    policy: 'isAuthenticated',
    permission: { resource: 'role', action: 'view' }
  },
  'POST /api/auth/roles': {
    controller: 'RoleController',
    action: 'create',
    policy: 'isAuthenticated',
    permission: { resource: 'role', action: 'create' }
  },
  'PUT /api/auth/roles/:id': {
    controller: 'RoleController',
    action: 'update',
    policy: 'isAuthenticated',
    permission: { resource: 'role', action: 'edit' }
  },
  'DELETE /api/auth/roles/:id': {
    controller: 'RoleController',
    action: 'delete',
    policy: 'isAuthenticated',
    permission: { resource: 'role', action: 'delete' }
  },
  'POST /api/auth/roles/:id/users': {
    controller: 'RoleController',
    action: 'assignUsers',
    policy: 'isAuthenticated',
    permission: { resource: 'role', action: 'manage' }
  },
  'DELETE /api/auth/roles/:id/users': {
    controller: 'RoleController',
    action: 'removeUsers',
    policy: 'isAuthenticated',
    permission: { resource: 'role', action: 'manage' }
  },
  
  // User routes
  'GET /api/auth/users': {
    controller: 'UsersController',
    action: 'find',
    policy: 'isAuthenticated',
    permission: { resource: 'user', action: 'view' }
  },
  'GET /api/auth/users/:id': {
    controller: 'UsersController',
    action: 'findOne',
    policy: 'isAuthenticated',
    permission: { resource: 'user', action: 'view' }
  },
  'PUT /api/auth/users/:id': {
    controller: 'UsersController',
    action: 'update',
    policy: 'isAuthenticated',
    permission: { resource: 'user', action: 'edit' }
  },
  'DELETE /api/auth/users/:id': {
    controller: 'UsersController',
    action: 'delete',
    policy: 'isAuthenticated',
    permission: { resource: 'user', action: 'delete' }
  },
  'PUT /api/auth/users/:id/roles': {
    controller: 'UsersController',
    action: 'updateRoles',
    policy: 'isAuthenticated',
    permission: { resource: 'user', action: 'manage' }
  },
  'GET /api/auth/users/:id/permissions': {
    controller: 'UsersController',
    action: 'getPermissions',
    policy: 'isAuthenticated',
    permission: { resource: 'user', action: 'view' }
  },
  // Self-permissions endpoint - users can always see their own permissions
  'GET /api/auth/my/permissions': {
    controller: 'UsersController',
    action: 'getPermissions',
    policy: 'isAuthenticated'
  },
  
  // 'GET /api/sync/status': 'SyncController.getStatus',
  // 'POST /api/sync/products': 'SyncController.syncProducts',
  // 'POST /api/sync/all': 'SyncController.syncAll',
  // 'POST /api/sync/reset': 'SyncController.resetSync',
  // 'POST /api/sync/rebuild': 'SyncController.rebuildIndex',
  
}

