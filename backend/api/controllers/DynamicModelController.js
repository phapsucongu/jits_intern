/**
 * DynamicModelController
 *
 * @description :: Server-side actions for handling dynamic model operations.
 */

module.exports = {
  // Create a new dynamic model
  create: async function(req, res) {
    try {
      // Check if the user is authenticated
      if (!req.user || !req.user.id) {
        return res.forbidden({
          error: 'Authentication required.'
        });
      }
      
      // Find user with roles to check if they're an admin
      const user = await User.findOne({ id: req.user.id })
        .populate('roles');
      
      if (!user) {
        return res.forbidden({
          error: 'User not found.'
        });
      }
      
      // Check if user has Admin role (case-insensitive)
      const isAdmin = user.roles && user.roles.some(role => 
        role.name.toLowerCase() === 'admin'
      );
      
      if (!isAdmin) {
        return res.forbidden({
          error: 'Only admins can create models.'
        });
      }
      
      // Validate the request body
      let { name, displayName, fields } = req.body;
      
      if (!name || !displayName || !fields || !Array.isArray(fields)) {
        return res.badRequest({
          error: 'Model name, display name, and field definitions are required.'
        });
      }
      
      // Format model name - ensure first letter is capitalized and remove spaces
      if (name) {
        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1);
        // Remove spaces and special characters
        name = name.replace(/[^a-zA-Z0-9]/g, '');
      }
      
      // Check if a model with this name already exists (case-insensitive)
      const existingModels = await DynamicModel.find({
        where: { 
          isActive: true 
        }
      });
      
      const nameExists = existingModels.some(model => 
        model.name.toLowerCase() === name.toLowerCase()
      );
      
      if (nameExists) {
        return res.badRequest({
          error: `A model with the name "${name}" already exists.`
        });
      }
      
      // Create the new model
      const newModel = await DynamicModel.create({
        name,
        displayName,
        fields,
        createdBy: user.id  // Using the full user object we found earlier
      }).fetch();
      
      return res.status(201).json({
        message: 'Model created successfully.',
        model: newModel
      });
    } catch (error) {
      sails.log.error('Error creating dynamic model:', error);
      return res.serverError({
        error: 'Failed to create model.',
        details: error.message
      });
    }
  },
  
  // Get all dynamic models
  find: async function(req, res) {
    try {
      const models = await DynamicModel.find({
        where: { isActive: true }
      });
      
      return res.json(models);
    } catch (error) {
      sails.log.error('Error fetching dynamic models:', error);
      return res.serverError({
        error: 'Failed to fetch models.',
        details: error.message
      });
    }
  },
  
  // Get a specific dynamic model
  findOne: async function(req, res) {
    try {
      const modelId = req.params.id;
      const model = await DynamicModel.findOne({
        id: modelId,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: 'Model not found.'
        });
      }
      
      return res.json(model);
    } catch (error) {
      sails.log.error('Error fetching dynamic model:', error);
      return res.serverError({
        error: 'Failed to fetch model.',
        details: error.message
      });
    }
  },
  
  // Update a dynamic model
  update: async function(req, res) {
    try {
      // Check if the user is authenticated and has admin permissions
      if (!req.user || !req.user.id) {
        return res.forbidden({
          error: 'Authentication required.'
        });
      }
      
      // Find user with roles to check if they're an admin
      const user = await User.findOne({ id: req.user.id })
        .populate('roles');
      
      if (!user) {
        return res.forbidden({
          error: 'User not found.'
        });
      }
      
      // Check if user has Admin role
      const isAdmin = user.roles && user.roles.some(role => 
        role.name.toLowerCase() === 'admin'
      );
      
      if (!isAdmin) {
        return res.forbidden({
          error: 'Only admins can update models.'
        });
      }
      
      const modelId = req.params.id;
      let { name, displayName, fields } = req.body;
      
      // Find the model
      const model = await DynamicModel.findOne({
        id: modelId,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: 'Model not found.'
        });
      }
      
      // Update the model
      const updates = {};
      
      // Handle name update with proper formatting
      if (name) {
        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1);
        // Remove spaces and special characters
        name = name.replace(/[^a-zA-Z0-9]/g, '');
        
        // Check if the new name already exists
        if (name.toLowerCase() !== model.name.toLowerCase()) {
          const existingWithName = await DynamicModel.findOne({
            name: { 'contains': name },
            id: { '!=': modelId },
            isActive: true
          });
          
          if (existingWithName) {
            return res.badRequest({
              error: `A model with the name "${name}" already exists.`
            });
          }
          
          updates.name = name;
        }
      }
      
      if (displayName) updates.displayName = displayName;
      if (fields) updates.fields = fields;
      
      if (Object.keys(updates).length === 0) {
        return res.badRequest({
          error: 'No valid update fields provided.'
        });
      }
      
      const updatedModel = await DynamicModel.updateOne({
        id: modelId
      }).set(updates);
      
      return res.json({
        message: 'Model updated successfully.',
        model: updatedModel
      });
    } catch (error) {
      sails.log.error('Error updating dynamic model:', error);
      return res.serverError({
        error: 'Failed to update model.',
        details: error.message
      });
    }
  },
  
  // Delete a dynamic model
  delete: async function(req, res) {
    try {
      // Check if the user is authenticated and has admin permissions
      if (!req.user || !req.user.id) {
        return res.forbidden({
          error: 'Authentication required.'
        });
      }
      
      // Find user with roles to check if they're an admin
      const user = await User.findOne({ id: req.user.id })
        .populate('roles');
      
      if (!user) {
        return res.forbidden({
          error: 'User not found.'
        });
      }
      
      // Check if user has Admin role
      const isAdmin = user.roles && user.roles.some(role => 
        role.name.toLowerCase() === 'admin'
      );
      
      if (!isAdmin) {
        return res.forbidden({
          error: 'Only admins can delete models.'
        });
      }
      
      const modelId = req.params.id;
      
      // Find the model
      const model = await DynamicModel.findOne({
        id: modelId,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: 'Model not found.'
        });
      }
      
      // Soft delete by setting isActive to false
      const updatedModel = await DynamicModel.updateOne({
        id: modelId
      }).set({ isActive: false });
      
      return res.json({
        message: 'Model deleted successfully.',
        model: updatedModel
      });
    } catch (error) {
      sails.log.error('Error deleting dynamic model:', error);
      return res.serverError({
        error: 'Failed to delete model.',
        details: error.message
      });
    }
  }
};
