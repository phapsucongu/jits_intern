/**
 * checkRole.js
 * 
 * This policy checks if the authenticated user has the specified role.
 */

module.exports = function(roleName) {
  return async function(req, res, proceed) {
    try {
      // First verify the user is authenticated
      if (!req.user || !req.userId) {
        sails.log.error('Role check failed: User not authenticated');
        return res.forbidden({ error: 'Authentication required' });
      }

      const userId = req.userId;
      
      // Find the user with their roles
      const user = await User.findOne({ id: userId })
        .populate('roles');
      
      if (!user || !user.roles || user.roles.length === 0) {
        sails.log.error(`Role check failed: User ${userId} has no roles`);
        return res.forbidden({ 
          error: 'Permission denied', 
          details: 'Your account does not have the required role'
        });
      }
      
      // Check if the user has the required role
      const hasRole = user.roles.some(role => 
        role.name.toLowerCase() === roleName.toLowerCase()
      );
      
      if (!hasRole) {
        sails.log.error(`Role denied for user ${userId} - ${roleName}`);
        return res.forbidden({ 
          error: 'Permission denied', 
          details: `You don't have the required role: ${roleName}`
        });
      }
      
      // User has the role, proceed with the request
      return proceed();
    } catch (err) {
      sails.log.error('Role check error:', err);
      return res.serverError({ error: 'Error checking roles', details: err.message });
    }
  };
};
