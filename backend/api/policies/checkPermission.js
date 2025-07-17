/**
 * checkPermission.js
 * 
 * This policy checks if the authenticated user has the required permission
 * to perform an action on a resource.
 */

module.exports = function(resource, action) {
  return async function(req, res, proceed) {
    try {
      // First verify the user is authenticated
      if (!req.user || !req.userId) {
        sails.log.error('Permission check failed: User not authenticated');
        return res.forbidden({ error: 'Authentication required' });
      }

      const userId = req.userId;
      
      // Use the User model's helper function to check permission
      const hasPermission = await User.hasPermission(userId, resource, action);
      
      if (!hasPermission) {
        sails.log.error(`Permission denied for user ${userId} - ${resource}:${action}`);
        return res.forbidden({ 
          error: 'Permission denied', 
          details: `You don't have permission to ${action} ${resource}`
        });
      }
      
      // User has permission, proceed with the request
      return proceed();
    } catch (err) {
      sails.log.error('Permission check error:', err);
      return res.serverError({ error: 'Error checking permissions', details: err.message });
    }
  };
};
