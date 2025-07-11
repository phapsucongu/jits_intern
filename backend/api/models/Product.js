/**
 * Product.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: { type: 'string' },

    price: { type: 'number' },

    image: { type: 'string' }

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

  // Lifecycle Callbacks
  
  // After a product is created
  afterCreate: async function(newRecord, proceed) {
    try {
      await sails.helpers.promisify(
        sails.services.elasticsearchsync.queueOperation,
        'create',
        'Product',
        newRecord
      );
      sails.log.info(`Product ${newRecord.id} queued for Elasticsearch indexing after creation`);
    } catch (error) {
      sails.log.error(`Error queueing Product ${newRecord.id} for Elasticsearch indexing:`, error);
    }
    return proceed();
  },

  // After a product is updated
  afterUpdate: async function(updatedRecord, proceed) {
    try {
      await sails.helpers.promisify(
        sails.services.elasticsearchsync.queueOperation,
        'update',
        'Product',
        updatedRecord
      );
      sails.log.info(`Product ${updatedRecord.id} queued for Elasticsearch update`);
    } catch (error) {
      sails.log.error(`Error queueing Product ${updatedRecord.id} for Elasticsearch update:`, error);
    }
    return proceed();
  },

  // Before a product is destroyed
  beforeDestroy: async function(criteria, proceed) {
    try {
      // Find the products that will be destroyed
      const productsToDelete = await Product.find(criteria);
      
      // Queue each product for deletion in Elasticsearch
      for (const product of productsToDelete) {
        await sails.helpers.promisify(
          sails.services.elasticsearchsync.queueOperation,
          'delete',
          'Product',
          { id: product.id }
        );
        sails.log.info(`Product ${product.id} queued for Elasticsearch deletion`);
      }
    } catch (error) {
      sails.log.error('Error queueing products for Elasticsearch deletion:', error);
    }
    return proceed();
  }
};

