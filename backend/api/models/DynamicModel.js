/**
 * DynamicModel.js
 *
 * @description :: Stores definitions of dynamically created models
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  // Keep track of previous values for use in afterUpdate
  beforeUpdate: async function(values, proceed) {
    try {
      // If updating a model name, we need to track the old name for permission updates
      if (values.id && values.name) {
        const existingModel = await DynamicModel.findOne({ id: values.id });
        if (existingModel && existingModel.name !== values.name) {
          // Store the old name temporarily in the values object
          values._previousName = existingModel.name;
        }
      }
      return proceed();
    } catch (err) {
      return proceed(err);
    }
  },
  
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true,
      description: 'The name of the dynamic model (singular form).'
    },
    
    displayName: {
      type: 'string',
      required: true,
      description: 'Human-readable display name for the model.'
    },
    
    fields: {
      type: 'json',
      required: true,
      description: 'JSON definition of model fields with their types and validations.'
    },
    
    createdBy: {
      model: 'user',
      description: 'Reference to the user who created this model.'
    },
    
    isActive: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Whether the model is active and accessible.'
    }
  },
  
  // Lifecycle callbacks
  beforeCreate: async function(values, proceed) {
    try {
      // Ensure the model name follows proper naming conventions (singular, camelCase)
      if (values.name) {
        // Make first letter uppercase for model name convention
        values.name = values.name.charAt(0).toUpperCase() + values.name.slice(1);
        
        // Remove spaces and special characters
        values.name = values.name.replace(/[^a-zA-Z0-9]/g, '');
      }

      return proceed();
    } catch (err) {
      return proceed(err);
    }
  },
  
  afterCreate: async function(newRecord, proceed) {
    try {
      const resourceName = newRecord.name.toLowerCase();
      
      // Create permissions using findOrCreate to avoid duplicates
      const permissionPromises = [
        Permission.findOrCreate(
          { resource: resourceName, action: 'view' },
          { resource: resourceName, action: 'view', description: `Can view ${newRecord.displayName}` }
        ),
        Permission.findOrCreate(
          { resource: resourceName, action: 'create' },
          { resource: resourceName, action: 'create', description: `Can create ${newRecord.displayName}` }
        ),
        Permission.findOrCreate(
          { resource: resourceName, action: 'edit' },
          { resource: resourceName, action: 'edit', description: `Can edit ${newRecord.displayName}` }
        ),
        Permission.findOrCreate(
          { resource: resourceName, action: 'delete' },
          { resource: resourceName, action: 'delete', description: `Can delete ${newRecord.displayName}` }
        ),
        Permission.findOrCreate(
          { resource: resourceName, action: 'manage' },
          { resource: resourceName, action: 'manage', description: `Can manage ${newRecord.displayName}` }
        )
      ];
      
      const permissions = await Promise.all(permissionPromises);
      
      // Grant these permissions to the admin role
      const adminRole = await Role.findOne({ name: 'Admin' });
      if (adminRole) {
        // Extract the IDs from the permissions
        const permissionIds = permissions.map(p => p.id);
        
        // Add permissions to the admin role
        await Role.addToCollection(adminRole.id, 'permissions', permissionIds);
        sails.log.info(`Added permissions for ${resourceName} to Admin role`);
      }
      
      // Also grant permissions to the creator if they have a role other than Admin
      if (newRecord.createdBy) {
        const creator = await User.findOne(newRecord.createdBy).populate('roles');
        if (creator) {
          // Check if user is not already an admin
          const isAdmin = creator.roles.some(role => role.name === 'Admin');
          
          if (!isAdmin) {
            // Get user's roles
            const roleIds = creator.roles.map(r => r.id);
            
            // Add view and create permissions to each of their roles
            const viewPerm = permissions.find(p => p.action === 'view');
            const createPerm = permissions.find(p => p.action === 'create');
            
            if (viewPerm && roleIds.length > 0) {
              for (const roleId of roleIds) {
                await Role.addToCollection(roleId, 'permissions', viewPerm.id);
              }
              sails.log.info(`Added view permission for ${resourceName} to creator's roles`);
            }
            
            if (createPerm && roleIds.length > 0) {
              for (const roleId of roleIds) {
                await Role.addToCollection(roleId, 'permissions', createPerm.id);
              }
              sails.log.info(`Added create permission for ${resourceName} to creator's roles`);
            }
          }
        }
      }
    } catch (error) {
      sails.log.error(`Error setting up permissions for dynamic model ${newRecord.name}:`, error);
    }
    
    return proceed();
  },
  
  // When a dynamic model is updated
  afterUpdate: async function(updatedRecord, proceed) {
    try {
      // Check if model name was changed
      if (updatedRecord._previousName && updatedRecord.name !== updatedRecord._previousName) {
        const oldResourceName = updatedRecord._previousName.toLowerCase();
        const newResourceName = updatedRecord.name.toLowerCase();
        
        sails.log.info(`Dynamic model renamed from ${oldResourceName} to ${newResourceName}`);
        
        // Update permissions with new resource name
        const existingPermissions = await Permission.find({ resource: oldResourceName });
        
        // Create new permissions with the new name
        for (const oldPerm of existingPermissions) {
          await Permission.findOrCreate(
            { resource: newResourceName, action: oldPerm.action },
            { 
              resource: newResourceName, 
              action: oldPerm.action, 
              description: oldPerm.description.replace(oldResourceName, newResourceName) 
            }
          );
        }
        
        // Update DynamicData records
        await DynamicData.update(
          { modelName: updatedRecord._previousName },
          { modelName: updatedRecord.name }
        );
        
        sails.log.info(`Updated dynamic data records for renamed model ${newResourceName}`);
      }
      
      // If display name changed, update permission descriptions
      if (updatedRecord.displayName) {
        const resourceName = updatedRecord.name.toLowerCase();
        const permissions = await Permission.find({ resource: resourceName });
        
        for (const perm of permissions) {
          await Permission.update(
            { id: perm.id },
            { description: perm.description.replace(/Can \w+ [\w\s]+/, `Can ${perm.action} ${updatedRecord.displayName}`) }
          );
        }
      }
    } catch (error) {
      sails.log.error(`Error updating permissions for dynamic model ${updatedRecord.name}:`, error);
    }
    
    return proceed();
  },
  
  // Before deleting a dynamic model
  beforeDestroy: async function(criteria, proceed) {
    try {
      // Find the model to get its name before deletion
      const modelToDelete = await DynamicModel.findOne(criteria);
      if (!modelToDelete) {
        return proceed();
      }
      
      const resourceName = modelToDelete.name.toLowerCase();
      
      // Delete all related data records
      await DynamicData.destroy({ modelName: modelToDelete.name });
      sails.log.info(`Deleted all data records for dynamic model ${modelToDelete.name}`);
      
      // Delete related permissions
      const relatedPermissions = await Permission.find({ resource: resourceName });
      if (relatedPermissions && relatedPermissions.length > 0) {
        await Permission.destroy({ id: { in: relatedPermissions.map(p => p.id) } });
        sails.log.info(`Deleted permissions for dynamic model ${modelToDelete.name}`);
      }
      
      // Mark as inactive instead of hard delete
      if (criteria.where && criteria.where.id) {
        await DynamicModel.update({ id: criteria.where.id })
          .set({ isActive: false });
        sails.log.info(`Marked dynamic model ${modelToDelete.name} as inactive`);
        
        // We're handling deletion by setting isActive to false, so prevent actual record deletion
        return proceed(new Error('Model marked as inactive instead of deleted'));
      }
      
    } catch (error) {
      sails.log.error('Error in beforeDestroy of dynamic model:', error);
    }
    
    return proceed();
  }
};
