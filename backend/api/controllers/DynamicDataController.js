/**
 * DynamicDataController
 *
 * @description :: Server-side actions for handling dynamic data operations.
 */

module.exports = {
  // Create a new record for a dynamic model
  create: async function(req, res) {
    try {
      let modelName = req.params.model;
      const { data } = req.body;
      
      // Ensure first letter is uppercase to match model convention
      if (modelName && modelName.length > 0) {
        modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      }
      
      if (!data) {
        return res.badRequest({
          error: 'Data is required.'
        });
      }
      
      // Check if the model exists
      const model = await DynamicModel.findOne({
        name: modelName,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: `Model "${modelName}" not found.`
        });
      }
      
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.forbidden({
          error: 'User authentication required.'
        });
      }
      
      // Get full user details with roles for proper authorization
      const userId = req.user.id;
      const user = await User.findOne({ id: userId }).populate('roles');
      
      if (!user) {
        return res.forbidden({
          error: 'User not found or not authorized.'
        });
      }
      
      // Check if user has proper permissions - needs to be admin or have specific model permission
      const isAdmin = user.roles.some(role => role.name.toLowerCase() === 'admin');
      
      // Get role IDs
      const roleIds = user.roles.map(r => r.id);
      
      // Find permissions for the specific resource and action, then check if any of user's roles have that permission
      const permissions = await Permission.find({
        where: {
          resource: model.name.toLowerCase(),
          action: 'create'
        }
      }).populate('roles');
      
      // Check if any of the found permissions are associated with the user's roles
      const hasModelPermission = permissions.some(permission => 
        permission.roles && permission.roles.some(role => roleIds.includes(role.id))
      );
      
      if (!isAdmin && !hasModelPermission) {
        return res.forbidden({
          error: 'You do not have permission to create records for this model.'
        });
      }
      
      // Validate the data against the model definition
      const validationErrors = validateDataAgainstModel(data, model.fields);
      if (validationErrors.length > 0) {
        return res.badRequest({
          error: 'Validation failed.',
          validationErrors
        });
      }
      
      // Create the record
      const newRecord = await DynamicData.create({
        modelName: model.name,
        data,
        createdBy: user.id
      }).fetch();
      
      return res.status(201).json({
        message: 'Record created successfully.',
        record: newRecord
      });
    } catch (error) {
      sails.log.error('Error creating dynamic data record:', error);
      return res.serverError({
        error: 'Failed to create record.',
        details: error.message
      });
    }
  },
  
  // Get all records for a specific model
  find: async function(req, res) {
    try {
      let modelName = req.params.model;
      
      // Ensure first letter is uppercase to match model convention
      if (modelName && modelName.length > 0) {
        modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      }
      
      // Check if the model exists
      const model = await DynamicModel.findOne({
        name: modelName,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: `Model "${modelName}" not found.`
        });
      }
      
      // Pagination parameters
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const skip = (page - 1) * limit;
      
      // Find records with pagination
      const records = await DynamicData.find({
        where: { modelName: model.name },
        limit,
        skip
      });
      
      // Count total records
      const totalCount = await DynamicData.count({ modelName: model.name });
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const pagination = {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
      
      return res.json({
        results: records,
        pagination,
        model: {
          name: model.name,
          displayName: model.displayName,
          fields: model.fields
        }
      });
    } catch (error) {
      sails.log.error('Error fetching dynamic data records:', error);
      return res.serverError({
        error: 'Failed to fetch records.',
        details: error.message
      });
    }
  },
  
  // Get a specific record
  findOne: async function(req, res) {
    try {
      let modelName = req.params.model;
      const recordId = req.params.id;
      
      // Ensure first letter is uppercase to match model convention
      if (modelName && modelName.length > 0) {
        modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      }
      
      // Check if the model exists
      const model = await DynamicModel.findOne({
        name: modelName,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: `Model "${modelName}" not found.`
        });
      }
      
      // Find the record
      const record = await DynamicData.findOne({
        id: recordId,
        modelName: model.name
      });
      
      if (!record) {
        return res.notFound({
          error: 'Record not found.'
        });
      }
      
      return res.json({
        record,
        model: {
          name: model.name,
          displayName: model.displayName,
          fields: model.fields
        }
      });
    } catch (error) {
      sails.log.error('Error fetching dynamic data record:', error);
      return res.serverError({
        error: 'Failed to fetch record.',
        details: error.message
      });
    }
  },
  
  // Update a specific record
  update: async function(req, res) {
    try {
      let modelName = req.params.model;
      const recordId = req.params.id;
      
      // Ensure first letter is uppercase to match model convention
      if (modelName && modelName.length > 0) {
        modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      }
      const { data } = req.body;
      
      if (!data) {
        return res.badRequest({
          error: 'Data is required.'
        });
      }
      
      // Check if the model exists
      const model = await DynamicModel.findOne({
        name: modelName,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: `Model "${modelName}" not found.`
        });
      }
      
      // Find the record
      const record = await DynamicData.findOne({
        id: recordId,
        modelName: model.name
      });
      
      if (!record) {
        return res.notFound({
          error: 'Record not found.'
        });
      }
      
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.forbidden({
          error: 'User authentication required.'
        });
      }
      
      // Get full user details with roles for proper authorization
      const userId = req.user.id;
      const user = await User.findOne({ id: userId }).populate('roles');
      
      if (!user) {
        return res.forbidden({
          error: 'User not found or not authorized.'
        });
      }
      
      // Check if user has proper permissions - needs to be admin, record creator, or have specific model permission
      const isAdmin = user.roles.some(role => role.name.toLowerCase() === 'admin');
      const isCreator = record.createdBy === user.id;
      
      // Get role IDs
      const roleIds = user.roles.map(r => r.id);
      
      // Find permissions for the specific resource and action, then check if any of user's roles have that permission
      const permissions = await Permission.find({
        where: {
          resource: model.name.toLowerCase(),
          action: 'update'
        }
      }).populate('roles');
      
      // Check if any of the found permissions are associated with the user's roles
      const hasModelPermission = permissions.some(permission => 
        permission.roles && permission.roles.some(role => roleIds.includes(role.id))
      );
      
      if (!isAdmin && !isCreator && !hasModelPermission) {
        return res.forbidden({
          error: 'You do not have permission to update this record.'
        });
      }
      
      // Validate the data against the model definition
      const validationErrors = validateDataAgainstModel(data, model.fields);
      if (validationErrors.length > 0) {
        return res.badRequest({
          error: 'Validation failed.',
          validationErrors
        });
      }
      
      // Update the record
      const updatedRecord = await DynamicData.updateOne({
        id: recordId
      }).set({ data });
      
      return res.json({
        message: 'Record updated successfully.',
        record: updatedRecord
      });
    } catch (error) {
      sails.log.error('Error updating dynamic data record:', error);
      return res.serverError({
        error: 'Failed to update record.',
        details: error.message
      });
    }
  },
  
  // Delete a specific record
  destroy: async function(req, res) {
    try {
      let modelName = req.params.model;
      const recordId = req.params.id;
      
      // Ensure first letter is uppercase to match model convention
      if (modelName && modelName.length > 0) {
        modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      }
      
      // Check if the model exists
      const model = await DynamicModel.findOne({
        name: modelName,
        isActive: true
      });
      
      if (!model) {
        return res.notFound({
          error: `Model "${modelName}" not found.`
        });
      }
      
      // Find the record
      const record = await DynamicData.findOne({
        id: recordId,
        modelName: model.name
      });
      
      if (!record) {
        return res.notFound({
          error: 'Record not found.'
        });
      }
      
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.forbidden({
          error: 'User authentication required.'
        });
      }
      
      // Get full user details with roles for proper authorization
      const userId = req.user.id;
      const user = await User.findOne({ id: userId }).populate('roles');
      
      if (!user) {
        return res.forbidden({
          error: 'User not found or not authorized.'
        });
      }
      
      // Check if user has proper permissions - needs to be admin, record creator, or have specific model permission
      const isAdmin = user.roles.some(role => role.name.toLowerCase() === 'admin');
      const isCreator = record.createdBy === user.id;
      
      // Get role IDs
      const roleIds = user.roles.map(r => r.id);
      
      // Find permissions for the specific resource and action, then check if any of user's roles have that permission
      const permissions = await Permission.find({
        where: {
          resource: model.name.toLowerCase(),
          action: 'delete'
        }
      }).populate('roles');
      
      // Check if any of the found permissions are associated with the user's roles
      const hasModelPermission = permissions.some(permission => 
        permission.roles && permission.roles.some(role => roleIds.includes(role.id))
      );
      
      if (!isAdmin && !isCreator && !hasModelPermission) {
        return res.forbidden({
          error: 'You do not have permission to delete this record.'
        });
      }
      
      // Delete the record
      await DynamicData.destroyOne({ id: recordId });
      
      return res.json({
        message: 'Record deleted successfully.'
      });
    } catch (error) {
      sails.log.error('Error deleting dynamic data record:', error);
      return res.serverError({
        error: 'Failed to delete record.',
        details: error.message
      });
    }
  }
};

/**
 * Validate data against a model definition
 * @param {Object} data - The data to validate
 * @param {Array} fieldDefinitions - The field definitions from the model
 * @returns {Array} - An array of validation errors
 */
function validateDataAgainstModel(data, fieldDefinitions) {
  const errors = [];
  
  // Go through each field definition and validate
  fieldDefinitions.forEach(field => {
    const { name, type, required } = field;
    
    // Check required fields - but handle boolean values specially
    if (required) {
      if (type === 'boolean' && data[name] !== true && data[name] !== false) {
        errors.push({ field: name, message: `${name} is required.` });
        return; // Skip other validations for this field
      } else if (type !== 'boolean' && (data[name] === undefined || data[name] === null || data[name] === '')) {
        errors.push({ field: name, message: `${name} is required.` });
        return; // Skip other validations for this field
      }
    }
    
    // Skip validation if field is not present and not required
    if (data[name] === undefined || data[name] === null) {
      return;
    }
    
    // Type validation
    switch (type) {
      case 'string':
        // Convert to string if possible
        if (typeof data[name] !== 'string') {
          try {
            data[name] = String(data[name]);
          } catch (e) {
            errors.push({ field: name, message: `${name} must be a string.` });
          }
        }
        break;
      case 'number':
        // Try to convert to number if needed
        if (typeof data[name] !== 'number') {
          try {
            const num = Number(data[name]);
            if (isNaN(num)) {
              errors.push({ field: name, message: `${name} must be a valid number.` });
            } else {
              data[name] = num; // Update with converted value
            }
          } catch (e) {
            errors.push({ field: name, message: `${name} must be a number.` });
          }
        }
        break;
      case 'boolean':
        // Convert string representations to boolean if needed
        if (typeof data[name] !== 'boolean') {
          if (data[name] === 'true' || data[name] === '1' || data[name] === 1) {
            data[name] = true;
          } else if (data[name] === 'false' || data[name] === '0' || data[name] === 0) {
            data[name] = false;
          } else {
            errors.push({ field: name, message: `${name} must be a boolean.` });
          }
        }
        break;
      case 'date':
        // Try to parse as date
        try {
          const dateValue = new Date(data[name]);
          if (isNaN(dateValue.getTime())) {
            errors.push({ field: name, message: `${name} must be a valid date.` });
          } else {
            data[name] = dateValue.toISOString(); // Standardize date format
          }
        } catch (e) {
          errors.push({ field: name, message: `${name} must be a valid date.` });
        }
        break;
      // Add more type validations as needed
    }
  });
  
  return errors;
}
