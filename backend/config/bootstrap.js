/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function() {

  try {
    sails.log.info('Initializing searchProducts service...');
    const searchProducts = require('../api/services/searchProducts');
    if (searchProducts.initialize) {
      await searchProducts.initialize();
      sails.log.info('searchProducts service initialized successfully');
    }
  } catch (error) {
    sails.log.error('Failed to initialize searchProducts service:', error);
  }
  try {
    sails.log.info('Initializing elasticsearchSync service for Products...');
    const elasticsearchSync = require('../api/services/elasticsearchSync');
    if (elasticsearchSync.initialize) {
      await elasticsearchSync.initialize();
      sails.log.info('elasticsearchSync service initialized successfully');
      
      setTimeout(async () => {
        try {
          sails.log.info('Performing initial sync of all products...');
          await elasticsearchSync.syncAll('Product');
        } catch (err) {
          sails.log.error('Initial product sync failed:', err);
        }
      }, 5000);
    }
  } catch (error) {
    sails.log.error('Failed to initialize elasticsearchSync service:', error);
  }

};
