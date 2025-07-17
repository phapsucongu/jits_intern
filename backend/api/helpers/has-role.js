/**
 * hasRole.js
 *
 * @description :: Check if the current user has a specific role
 * @docs        :: https://sailsjs.com/docs/concepts/helpers
 */

module.exports = {
  friendlyName: 'Has role',
  
  description: 'Check if the current user has a specific role',
  
  inputs: {
    role: {
      description: 'The role name to check for',
      type: 'string',
      required: true
    },
    
    user: {
      description: 'The user object (defaults to req.user)',
      type: 'ref'
    }
  },
  
  exits: {
    success: {
      outputFriendlyName: 'Has role',
      outputDescription: 'Whether the user has the specified role',
      outputType: 'boolean'
    }
  },
  
  fn: async function (inputs, exits) {
    const user = inputs.user || this.req.user;
    
    if (!user || !user.id) {
      return exits.success(false);
    }
    
    // Find the user with their roles
    const userWithRoles = await User.findOne({ id: user.id })
      .populate('roles');
      
    if (!userWithRoles || !userWithRoles.roles || userWithRoles.roles.length === 0) {
      return exits.success(false);
    }
    
    // Check if user has the specified role
    const hasRole = userWithRoles.roles.some(r => 
      r.name.toLowerCase() === inputs.role.toLowerCase()
    );
    
    return exits.success(hasRole);
  }
};
