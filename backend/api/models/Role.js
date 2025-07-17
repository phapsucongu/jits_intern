/**
 * Role.js
 *
 * A role represents a set of permissions that can be assigned to users.
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    
    description: {
      type: 'string',
      allowNull: true
    },
    
    // Relationships
    permissions: {
      collection: 'permission',
      via: 'roles'
    },
    
    users: {
      collection: 'user',
      via: 'roles'
    }
  },
  
  // Lifecycle callbacks
  beforeCreate: async function(values, proceed) {
    // Ensure role names are unique (case insensitive)
    try {
      // Use a simpler query that's compatible with Waterline
      const existingRole = await Role.findOne({
        name: { 'contains': values.name }
      });
      
      // Do a case-insensitive comparison manually
      if (existingRole && existingRole.name.toLowerCase() === values.name.toLowerCase()) {
        return proceed(new Error('A role with this name already exists'));
      }
      
      // Convert role name to title case
      if (values.name) {
        values.name = values.name.charAt(0).toUpperCase() + values.name.slice(1).toLowerCase();
      }
      
      return proceed();
    } catch (err) {
      return proceed(err);
    }
  }
};
