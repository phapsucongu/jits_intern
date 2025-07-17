/**
 * Permission.js
 *
 * A permission represents a specific action that can be performed on a resource.
 */

module.exports = {
  attributes: {
    resource: {
      type: 'string',
      required: true,
      description: 'The resource this permission applies to (e.g., "product", "category")'
    },
    
    action: {
      type: 'string',
      required: true,
      isIn: ['view', 'create', 'edit', 'delete', 'manage', '*'],
      description: 'The action this permission grants (e.g., "view", "create", "edit", "delete", "manage", or "*" for all actions)'
    },
    
    description: {
      type: 'string',
      allowNull: true
    },
    
    // Each permission can be associated with multiple roles
    roles: {
      collection: 'role',
      via: 'permissions'
    }
  },
  
  // Validate that combinations of resource+action are unique
  beforeCreate: async function(values, proceed) {
    try {
      // Ensure resource and action are provided
      if (!values.resource || !values.action) {
        return proceed(new Error('Both resource and action are required'));
      }
      
      // Check if permission already exists
      const existingPermission = await Permission.findOne({
        resource: values.resource,
        action: values.action
      });
      
      if (existingPermission) {
        return proceed(new Error(`Permission already exists for ${values.action} on ${values.resource}`));
      }
      
      // Generate description if not provided
      if (!values.description) {
        values.description = `Can ${values.action} ${values.resource}`;
      }
      
      return proceed();
    } catch (err) {
      return proceed(err);
    }
  }
};
