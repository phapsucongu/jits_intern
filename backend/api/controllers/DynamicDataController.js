/**
 * DynamicDataController
 *
 * @description :: Server-side actions for handling dynamic data operations.
 */

// Utility functions
const Utils = {
  /**
   * Format a consistent response object
   * @param {string} status - Success or error status
   * @param {string} message - Message to display
   * @param {Object} data - Any additional data to include
   * @returns {Object} - Formatted response
   */
  formatResponse(status, message, data = {}) {
    return {
      status,
      message,
      ...data
    };
  },

  /**
   * Handle errors consistently
   * @param {Error} error - The error object
   * @param {string} operation - What operation was being performed
   */
  logError(error, operation) {
    sails.log.error(`Error ${operation}:`, error);
    return {
      error: `Failed to ${operation}.`,
      details: error.message
    };
  },

  /**
   * Normalize model name to ensure first letter is uppercase
   * @param {string} modelName - The model name to normalize
   * @returns {string} - The normalized model name
   */
  normalizeModelName(modelName) {
    if (!modelName || !modelName.length) return modelName;
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  },

  /**
   * Extract and validate pagination parameters
   * @param {Object} query - Request query object
   * @returns {Object} - Pagination parameters
   */
  getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
  }
};

// Authentication and authorization functions
const Auth = {
  /**
   * Get authenticated user with roles
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} - The user or an error response
   */
  async getAuthenticatedUser(req, res) {
    // Check authentication
    if (!req.user || !req.user.id) {
      return {
        error: res.forbidden({
          error: 'User authentication required.'
        })
      };
    }
    
    // Get full user details with roles for proper authorization
    const userId = req.user.id;
    const user = await User.findOne({ id: userId }).populate('roles');
    
    if (!user) {
      return {
        error: res.forbidden({
          error: 'User not found or not authorized.'
        })
      };
    }
    
    return { user };
  },

  /**
   * Check if a user has permission for a specific action on a model
   * @param {Object} user - The user object with populated roles
   * @param {Object} model - The model object
   * @param {string} action - The action to check permission for
   * @returns {Promise<boolean>} - Whether the user has permission
   */
  async checkPermission(user, model, action) {
    // Check if user is admin
    const isAdmin = user.roles.some(role => role.name.toLowerCase() === 'admin');
    if (isAdmin) return true;
    
    // Get role IDs
    const roleIds = user.roles.map(r => r.id);
    
    // Find permissions for the specific resource and action
    const permissions = await Permission.find({
      where: {
        resource: model.name.toLowerCase(),
        action: action
      }
    }).populate('roles');
    
    // Check if any of the found permissions are associated with the user's roles
    return permissions.some(permission => 
      permission.roles && permission.roles.some(role => roleIds.includes(role.id))
    );
  }
};

// Model functions
const ModelOperations = {
  /**
   * Get model from request and validate it exists
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} - The model or an error response
   */
  async getModelAndValidate(req, res) {
    const modelName = Utils.normalizeModelName(req.params.model);
    
    // Check if the model exists
    const model = await DynamicModel.findOne({
      name: modelName,
      isActive: true
    });
    
    if (!model) {
      return { 
        error: res.notFound({
          error: `Model "${modelName}" not found.`
        })
      };
    }
    
    return { model };
  },

  /**
   * Get model and authorize user
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {string} action - The action to authorize
   * @returns {Object} - The model, user, or an error response
   */
  async getModelAndAuthorize(req, res, action) {
    // Get model and validate
    const modelResult = await this.getModelAndValidate(req, res);
    if (modelResult.error) return modelResult;
    
    // Get authenticated user
    const userResult = await Auth.getAuthenticatedUser(req, res);
    if (userResult.error) return userResult;
    
    // Check permissions
    const hasPermission = await Auth.checkPermission(userResult.user, modelResult.model, action);
    if (!hasPermission) {
      return {
        error: res.forbidden({
          error: `You do not have permission to ${action} records for this model.`
        })
      };
    }
    
    return { model: modelResult.model, user: userResult.user };
  },

  /**
   * Get model, record and authorize user
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {string} recordId - The ID of the record
   * @param {string} action - The action to authorize
   * @returns {Object} - The model, record, user, or an error response
   */
  async getModelRecordAndAuthorize(req, res, recordId, action) {
    // Get model, user and authorize
    const result = await this.getModelAndAuthorize(req, res, action);
    if (result.error) return result;
    
    // Find the record
    const record = await DynamicData.findOne({
      id: recordId,
      modelName: result.model.name
    });
    
    if (!record) {
      return {
        error: res.notFound({
          error: 'Record not found.'
        })
      };
    }
    
    // Check if user is the creator (special permission)
    const isCreator = record.createdBy === result.user.id;
    
    // If not admin or creator and no model permission, check again with the record context
    const isAdmin = result.user.roles.some(role => role.name.toLowerCase() === 'admin');
    if (!isAdmin && !isCreator && !(await Auth.checkPermission(result.user, result.model, action))) {
      return {
        error: res.forbidden({
          error: `You do not have permission to ${action} this record.`
        })
      };
    }
    
    return { model: result.model, record, user: result.user };
  },

  /**
   * Validate data against a model definition
   * @param {Object} data - The data to validate
   * @param {Array} fieldDefinitions - The field definitions from the model
   * @returns {Array} - An array of validation errors
   */
  validateDataAgainstModel(data, fieldDefinitions) {
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
};

// Controller actions
module.exports = {
  /**
   * Create a new record for a dynamic model
   */
  create: async function(req, res) {
    try {
      const { data } = req.body;
      if (!data) {
        return res.badRequest({ error: 'Data is required.' });
      }
      
      // Get model and check authorization
      const { model, user, error } = await ModelOperations.getModelAndAuthorize(req, res, 'create');
      if (error) return error;
      
      // Validate the data against the model definition
      const validationErrors = ModelOperations.validateDataAgainstModel(data, model.fields);
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
      
      return res.status(201).json(Utils.formatResponse(
        'success',
        'Record created successfully.',
        { record: newRecord }
      ));
    } catch (error) {
      sails.log.error('Error creating dynamic data record:', error);
      return res.serverError(Utils.logError(error, 'create record'));
    }
  },
  
  /**
   * Get all records for a specific model with pagination
   */
  find: async function(req, res) {
    try {
      // Get model and check if it exists
      const { model, error } = await ModelOperations.getModelAndValidate(req, res);
      if (error) return error;
      
      // Get pagination parameters
      const { page, limit, skip } = Utils.getPaginationParams(req.query);
      
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
      return res.serverError(Utils.logError(error, 'fetch records'));
    }
  },
  
  /**
   * Get a specific record by ID
   */
  findOne: async function(req, res) {
    try {
      const recordId = req.params.id;
      
      // Get model and check if it exists
      const { model, error } = await ModelOperations.getModelAndValidate(req, res);
      if (error) return error;
      
      // Find the record
      const record = await DynamicData.findOne({
        id: recordId,
        modelName: model.name
      });
      
      if (!record) {
        return res.notFound({ error: 'Record not found.' });
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
      return res.serverError(Utils.logError(error, 'fetch record'));
    }
  },
  
  /**
   * Update a specific record by ID
   */
  update: async function(req, res) {
    try {
      const recordId = req.params.id;
      const { data } = req.body;
      
      if (!data) {
        return res.badRequest({ error: 'Data is required.' });
      }
      
      // Get model, record, and authorization
      const { model, record, user, error } = await ModelOperations.getModelRecordAndAuthorize(req, res, recordId, 'update');
      if (error) return error;
      
      // Validate the data against the model definition
      const validationErrors = ModelOperations.validateDataAgainstModel(data, model.fields);
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
      
      return res.json(Utils.formatResponse(
        'success',
        'Record updated successfully.',
        { record: updatedRecord }
      ));
    } catch (error) {
      sails.log.error('Error updating dynamic data record:', error);
      return res.serverError(Utils.logError(error, 'update record'));
    }
  },
  
  /**
   * Delete a specific record by ID
   */
  destroy: async function(req, res) {
    try {
      const recordId = req.params.id;
      
      // Get model, record, and authorization
      const { model, record, error } = await ModelOperations.getModelRecordAndAuthorize(req, res, recordId, 'delete');
      if (error) return error;
      
      // Delete the record
      await DynamicData.destroyOne({ id: recordId });
      
      return res.json(Utils.formatResponse(
        'success',
        'Record deleted successfully.'
      ));
    } catch (error) {
      sails.log.error('Error deleting dynamic data record:', error);
      return res.serverError(Utils.logError(error, 'delete record'));
    }
  }
};
