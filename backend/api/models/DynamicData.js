/**
 * DynamicData.js
 *
 * @description :: Stores data for dynamically created models
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    modelName: {
      type: 'string',
      required: true,
      description: 'The name of the dynamic model this data belongs to.'
    },
    
    data: {
      type: 'json',
      required: true,
      description: 'The actual data for this record.'
    },
    
    createdBy: {
      model: 'user',
      description: 'Reference to the user who created this record.'
    }
  },
  
  // Create index on modelName to enable efficient querying
  indexes: [
    {
      attributes: { modelName: 1 }
    }
  ]
};
