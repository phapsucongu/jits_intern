/**
 * RoleController.js
 * 
 * Controller for managing roles and their permissions.
 */

module.exports = {
  /**
   * List all roles
   */
  find: async function(req, res) {
    try {
      const roles = await Role.find()
        .populate('permissions');
      
      return res.json(roles);
    } catch (err) {
      sails.log.error('Error finding roles:', err);
      return res.serverError({
        error: 'Failed to retrieve roles',
        details: err.message
      });
    }
  },
  
  /**
   * Find a specific role by ID
   */
  findOne: async function(req, res) {
    try {
      const roleId = req.params.id;
      
      if (!roleId) {
        return res.badRequest({error: 'Role ID is required'});
      }
      
      const role = await Role.findOne({id: roleId})
        .populate('permissions')
        .populate('users');
      
      if (!role) {
        return res.notFound({error: 'Role not found'});
      }
      
      return res.json(role);
    } catch (err) {
      sails.log.error('Error finding role:', err);
      return res.serverError({
        error: 'Failed to retrieve role',
        details: err.message
      });
    }
  },
  
  /**
   * Create a new role
   */
  create: async function(req, res) {
    try {
      const { name, description, permissions } = req.body;
      
      if (!name) {
        return res.badRequest({error: 'Role name is required'});
      }
      
      // Create the role
      const newRole = await Role.create({
        name,
        description
      }).fetch();
      
      // If permissions are provided, add them to the role
      if (permissions && permissions.length > 0) {
        await Role.addToCollection(newRole.id, 'permissions', permissions);
      }
      
      // Fetch the role with its permissions
      const role = await Role.findOne({id: newRole.id})
        .populate('permissions');
      
      return res.status(201).json(role);
    } catch (err) {
      sails.log.error('Error creating role:', err);
      return res.serverError({
        error: 'Failed to create role',
        details: err.message
      });
    }
  },
  
  /**
   * Update a role
   */
  update: async function(req, res) {
    try {
      const roleId = req.params.id;
      const { name, description, permissions } = req.body;
      
      if (!roleId) {
        return res.badRequest({error: 'Role ID is required'});
      }
      
      // Check if role exists
      const existingRole = await Role.findOne({id: roleId});
      if (!existingRole) {
        return res.notFound({error: 'Role not found'});
      }
      
      // Update role attributes
      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      
      // Update the role if there are changes
      if (Object.keys(updates).length > 0) {
        await Role.updateOne({id: roleId}).set(updates);
      }
      
      // Update permissions if provided
      if (permissions) {
        // Remove existing permissions
        await Role.removeFromCollection(roleId, 'permissions');
        
        // Add new permissions if any
        if (permissions.length > 0) {
          await Role.addToCollection(roleId, 'permissions', permissions);
        }
      }
      
      // Get the updated role
      const updatedRole = await Role.findOne({id: roleId})
        .populate('permissions');
      
      return res.json(updatedRole);
    } catch (err) {
      sails.log.error('Error updating role:', err);
      return res.serverError({
        error: 'Failed to update role',
        details: err.message
      });
    }
  },
  
  /**
   * Delete a role
   */
  delete: async function(req, res) {
    try {
      const roleId = req.params.id;
      
      if (!roleId) {
        return res.badRequest({error: 'Role ID is required'});
      }
      
      // Check if role exists
      const existingRole = await Role.findOne({id: roleId});
      if (!existingRole) {
        return res.notFound({error: 'Role not found'});
      }
      
      // Check if this is a default role that shouldn't be deleted
      if (existingRole.name === 'Admin' || existingRole.name === 'SuperAdmin') {
        return res.forbidden({error: 'Cannot delete system roles'});
      }
      
      // Delete the role
      await Role.destroyOne({id: roleId});
      
      return res.json({
        message: `Role '${existingRole.name}' deleted successfully`
      });
    } catch (err) {
      sails.log.error('Error deleting role:', err);
      return res.serverError({
        error: 'Failed to delete role',
        details: err.message
      });
    }
  },
  
  /**
   * Assign users to a role
   */
  assignUsers: async function(req, res) {
    try {
      const roleId = req.params.id;
      const { users } = req.body;
      
      if (!roleId) {
        return res.badRequest({error: 'Role ID is required'});
      }
      
      if (!users || !Array.isArray(users) || users.length === 0) {
        return res.badRequest({error: 'User IDs array is required'});
      }
      
      // Check if role exists
      const existingRole = await Role.findOne({id: roleId});
      if (!existingRole) {
        return res.notFound({error: 'Role not found'});
      }
      
      // Add users to the role
      await Role.addToCollection(roleId, 'users', users);
      
      return res.json({
        message: `Users assigned to role '${existingRole.name}' successfully`
      });
    } catch (err) {
      sails.log.error('Error assigning users to role:', err);
      return res.serverError({
        error: 'Failed to assign users to role',
        details: err.message
      });
    }
  },
  
  /**
   * Remove users from a role
   */
  removeUsers: async function(req, res) {
    try {
      const roleId = req.params.id;
      const { users } = req.body;
      
      if (!roleId) {
        return res.badRequest({error: 'Role ID is required'});
      }
      
      if (!users || !Array.isArray(users) || users.length === 0) {
        return res.badRequest({error: 'User IDs array is required'});
      }
      
      // Check if role exists
      const existingRole = await Role.findOne({id: roleId});
      if (!existingRole) {
        return res.notFound({error: 'Role not found'});
      }
      
      // Remove users from the role
      await Role.removeFromCollection(roleId, 'users', users);
      
      return res.json({
        message: `Users removed from role '${existingRole.name}' successfully`
      });
    } catch (err) {
      sails.log.error('Error removing users from role:', err);
      return res.serverError({
        error: 'Failed to remove users from role',
        details: err.message
      });
    }
  }
};
