/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

// Helper function to create permission policy
const checkPermission = (resource, action) => 
  (req, res, next) => require('../api/policies/checkPermission')(resource, action)(req, res, next);

// Helper function to create role policy
const checkRole = (role) => 
  (req, res, next) => require('../api/policies/checkRole')(role)(req, res, next);

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,
  
  // Authentication endpoints don't need permission checks
  'UsersController': {
    'register': true,
    'login': true,
    'validate': 'isAuthenticated',
    
    // User management operations require appropriate permissions
    'find': ['isAuthenticated', checkPermission('user', 'view')],
    'findOne': ['isAuthenticated', checkPermission('user', 'view')],
    'update': ['isAuthenticated', checkPermission('user', 'edit')],
    'destroy': ['isAuthenticated', checkPermission('user', 'delete')]
  },
  
  'ProductController': {
    // Apply both isAuthenticated policy and permission check for all product operations
    'find': 'isAuthenticated',
    'findOne': 'isAuthenticated',
    'search': 'isAuthenticated',
    'paginate': 'isAuthenticated',
    'create': ['isAuthenticated', checkPermission('product', 'create')],
    'update': ['isAuthenticated', checkPermission('product', 'edit')],
    'destroy': ['isAuthenticated', checkPermission('product', 'delete')]
  },
  
  'RoleController': {
    // Two options for accessing role management: either having the 'role:manage' permission or being an Admin
    '*': ['isAuthenticated', checkPermission('role', 'manage')]
  },
  
  'PermissionController': {
    // Only allow Admin role to manage permissions directly
    '*': ['isAuthenticated', checkRole('Admin')]
  },
  
  'SyncController': {
    '*': 'isAuthenticated'
  },
};
