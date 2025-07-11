/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

const { search } = require("../api/controllers/ProductController");

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,
  'ProductController': {
    find: 'isAuthenticated',
    findOne: 'isAuthenticated',
    create: 'isAuthenticated',
    update: 'isAuthenticated',
    destroy: 'isAuthenticated',
    search: 'isAuthenticated',
  },
  
  'SyncController': {
    '*': 'isAuthenticated'
  },
};
