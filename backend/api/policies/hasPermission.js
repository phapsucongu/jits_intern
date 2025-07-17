/**
 * hasPermission.js
 * 
 * A policy that checks if the authenticated user has the specified permission
 * Usage example in routes.js:
 * 'GET /api/products': { action: 'product/find', policy: 'hasPermission', permission: { resource: 'product', action: 'view' } }
 */

module.exports = async function(req, res, proceed) {
  try {
    // First, ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.forbidden({error: 'Authentication required'});
    }

    // Get the required permission from route options
    const routePath = req.route.path;
    const routeOptions = sails.config.routes[req.route.method + ' ' + routePath];
    
    if (!routeOptions || !routeOptions.permission) {
      sails.log.warn(`No permission defined for route: ${req.route.method} ${routePath}`);
      return proceed();
    }

    const { resource, action } = routeOptions.permission;
    
    // If no resource or action is specified, proceed
    if (!resource || !action) {
      return proceed();
    }
    
    // Check if user has permission
    const hasPermission = await User.hasPermission(req.user.id, resource, action);
    
    if (hasPermission) {
      return proceed();
    } else {
      return res.forbidden({
        error: 'Access denied',
        message: `You don't have permission to ${action} ${resource}`
      });
    }
  } catch (err) {
    sails.log.error('Error in hasPermission policy:', err);
    return res.serverError({
      error: 'Permission check failed',
      details: err.message
    });
  }
};
