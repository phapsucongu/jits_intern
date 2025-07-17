/**
 * Users.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
      maxLength: 100,
      description: 'The email address of the user, must be unique and valid.',
    },

    password: {
      type: 'string',
      required: true,
      minLength: 8,
      maxLength: 528,
      description: 'The password of the user, must be at least 8 characters long.',
    },

    firstName: {
      type: 'string',
      allowNull: true,
      maxLength: 50,
      description: 'The first name of the user.'
    },

    lastName: {
      type: 'string',
      allowNull: true,
      maxLength: 50,
      description: 'The last name of the user.'
    },

    active: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Whether the user account is active or disabled.'
    },

    lastLogin: {
      type: 'number',
      allowNull: true,
      description: 'The timestamp of the user\'s last login.'
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    
    // A user can have multiple roles
    roles: {
      collection: 'role',
      via: 'users'
    }
  },
  // Include this method to hide sensitive data when returning user objects
  customToJSON: function() {
    // Return a shallow copy of this record without sensitive data
    return _.omit(this, ['password']);
  },

  // Helper function to check if a user has a specific permission
  hasPermission: async function(userId, resource, action) {
    try {
      // Find the user with their roles and the roles' permissions
      const user = await User.findOne({ id: userId })
        .populate('roles');

      if (!user || !user.roles || user.roles.length === 0) {
        return false;
      }

      // Get all role IDs for this user
      const roleIds = user.roles.map(role => role.id);

      // Find all permissions for these roles that match the requested resource and action
      const roles = await Role.find({ id: { in: roleIds } })
        .populate('permissions');

      // Check if any role has the requested permission
      for (const role of roles) {
        for (const permission of role.permissions) {
          if (
            (permission.resource === resource && permission.action === action) || 
            (permission.resource === resource && permission.action === 'manage') ||
            (permission.resource === '*' && permission.action === '*')
          ) {
            return true;
          }
        }
      }

      return false;
    } catch (err) {
      sails.log.error('Error checking user permissions:', err);
      return false;
    }
  }
};

