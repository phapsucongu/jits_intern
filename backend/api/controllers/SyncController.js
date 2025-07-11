/**
 * SyncController.js
 * 
 * @description :: Server-side actions for handling MongoDB-Elasticsearch synchronization
 */

module.exports = {
  /**
   * GET /api/sync/status
   * Get the current status of the synchronization process
   */
  getStatus: async function(req, res) {
    try {
      const status = sails.services.elasticsearchsync.getStatus();
      return res.json({
        status: 'success',
        data: status,
        timestamp: new Date()
      });
    } catch (error) {
      return res.serverError({
        status: 'error',
        message: 'Failed to get sync status',
        error: error.message
      });
    }
  },

  /**
   * POST /api/sync/products
   * Sync all products from MongoDB to Elasticsearch
   */
  syncProducts: async function(req, res) {
    try {
      const result = await sails.services.elasticsearchsync.syncAll('Product');
      return res.json({
        status: 'success',
        message: `Synced ${result.count} products to Elasticsearch`,
        data: result
      });
    } catch (error) {
      return res.serverError({
        status: 'error',
        message: 'Failed to sync products',
        error: error.message
      });
    }
  },
  
  /**
   * POST /api/sync/all
   * Sync all products from MongoDB to Elasticsearch (alias for syncProducts)
   */
  syncAll: async function(req, res) {
    try {
      const result = await sails.services.elasticsearchsync.syncAll('Product');
      return res.json({
        status: 'success',
        message: `Synced ${result.count} products to Elasticsearch`,
        data: { products: result }
      });
    } catch (error) {
      return res.serverError({
        status: 'error',
        message: 'Failed to sync products',
        error: error.message
      });
    }
  },

  /**
   * POST /api/sync/reset
   * Reset the sync service
   */
  resetSync: async function(req, res) {
    try {
      sails.services.elasticsearchsync.reset();
      return res.json({
        status: 'success',
        message: 'Sync service reset successfully',
        timestamp: new Date()
      });
    } catch (error) {
      return res.serverError({
        status: 'error',
        message: 'Failed to reset sync service',
        error: error.message
      });
    }
  },
  
  /**
   * POST /api/sync/rebuild
   * Rebuild the Elasticsearch index from scratch
   */
  rebuildIndex: async function(req, res) {
    try {
      const result = await sails.services.elasticsearchsync.rebuildIndex();
      return res.json({
        status: 'success',
        message: `Elasticsearch index rebuilt with ${result.count} products`,
        data: result
      });
    } catch (error) {
      return res.serverError({
        status: 'error',
        message: 'Failed to rebuild index',
        error: error.message
      });
    }
  }
};
