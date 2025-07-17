/**
 * PermissionController.js
 * 
 * Controller for managing permissions.
 */

module.exports = {
  /**
   * List all permissions
   */
  find: async function(req, res) {
    try {
      const permissions = await Permission.find();
      return res.json(permissions);
    } catch (err) {
      sails.log.error('Error finding permissions:', err);
      return res.serverError({
        error: 'Failed to retrieve permissions',
        details: err.message
      });
    }
  },
  
  /**
   * Find a specific permission by ID
   */
  findOne: async function(req, res) {
    try {
      const permissionId = req.params.id;
      
      if (!permissionId) {
        return res.badRequest({error: 'Permission ID is required'});
      }
      
      const permission = await Permission.findOne({id: permissionId})
        .populate('roles');
      
      if (!permission) {
        return res.notFound({error: 'Permission not found'});
      }
      
      return res.json(permission);
    } catch (err) {
      sails.log.error('Error finding permission:', err);
      return res.serverError({
        error: 'Failed to retrieve permission',
        details: err.message
      });
    }
  },
  
  /**
   * Create a new permission
   */
  create: async function(req, res) {
    try {
      const { resource, action, description } = req.body;
      
      if (!resource || !action) {
        return res.badRequest({error: 'Resource and action are required'});
      }
      
      // Create the permission
      const newPermission = await Permission.create({
        resource,
        action,
        description: description || `Can ${action} ${resource}`
      }).fetch();
      
      return res.status(201).json(newPermission);
    } catch (err) {
      sails.log.error('Error creating permission:', err);
      return res.serverError({
        error: 'Failed to create permission',
        details: err.message
      });
    }
  },
  
  /**
   * Update a permission
   */
  update: async function(req, res) {
    try {
      const permissionId = req.params.id;
      const { resource, action, description } = req.body;
      
      if (!permissionId) {
        return res.badRequest({error: 'Permission ID is required'});
      }
      
      // Check if permission exists
      const existingPermission = await Permission.findOne({id: permissionId});
      if (!existingPermission) {
        return res.notFound({error: 'Permission not found'});
      }
      
      // Update permission attributes
      const updates = {};
      if (resource) updates.resource = resource;
      if (action) updates.action = action;
      if (description !== undefined) updates.description = description;
      
      // Update the permission
      const updatedPermission = await Permission.updateOne({id: permissionId})
        .set(updates);
      
      return res.json(updatedPermission);
    } catch (err) {
      sails.log.error('Error updating permission:', err);
      return res.serverError({
        error: 'Failed to update permission',
        details: err.message
      });
    }
  },
  
  /**
   * Delete a permission
   */
  delete: async function(req, res) {
    try {
      const permissionId = req.params.id;
      
      if (!permissionId) {
        return res.badRequest({error: 'Permission ID is required'});
      }
      
      // Check if permission exists
      const existingPermission = await Permission.findOne({id: permissionId});
      if (!existingPermission) {
        return res.notFound({error: 'Permission not found'});
      }
      
      // Check if it's a core permission that shouldn't be deleted
      if (existingPermission.resource === '*' && existingPermission.action === '*') {
        return res.forbidden({error: 'Cannot delete system permissions'});
      }
      
      // Delete the permission
      await Permission.destroyOne({id: permissionId});
      
      return res.json({
        message: `Permission '${existingPermission.action} ${existingPermission.resource}' deleted successfully`
      });
    } catch (err) {
      sails.log.error('Error deleting permission:', err);
      return res.serverError({
        error: 'Failed to delete permission',
        details: err.message
      });
    }
  },
  
  /**
   * Initialize default permissions
   * This can be called during bootstrap to ensure default permissions exist
   */
  initializeDefaultPermissions: async function() {
    try {
      sails.log.info('Initializing default permissions...');
      
      // Define default resources
      const resources = ['product', 'category', 'user', 'role', 'permission'];
      
      // Define default actions
      const actions = ['view', 'create', 'edit', 'delete', 'manage'];
      
      // First try to find the admin permission without creating it
      let adminPermission = await Permission.findOne({ resource: '*', action: '*' });
      
      // If it doesn't exist, create it
      if (!adminPermission) {
        try {
          adminPermission = await Permission.create({
            resource: '*',
            action: '*',
            description: 'Administrator access to all resources'
          }).fetch();
          sails.log.info('Created admin wildcard permission');
        } catch (error) {
          sails.log.error('Error creating admin wildcard permission:', error);
          // Continue with other permissions even if this fails
        }
      }
      
      // Create permissions for each resource and action
      for (const resource of resources) {
        for (const action of actions) {
          // Skip 'manage' action for all resources except special ones
          if (action === 'manage' && !['user', 'role', 'permission'].includes(resource)) {
            continue;
          }
          
          try {
            // First check if it exists
            const exists = await Permission.findOne({ resource, action });
            
            if (!exists) {
              await Permission.create({
                resource, 
                action, 
                description: `Can ${action} ${resource}`
              });
            }
          } catch (error) {
            sails.log.warn(`Error creating permission ${resource}:${action}:`, error.message);
            // Continue with next permission
          }
        }
      }
      
      sails.log.info('Default permissions initialized successfully');
      return true;
    } catch (err) {
      sails.log.error('Error initializing default permissions:', err);
      return false;
    }
  }
};
