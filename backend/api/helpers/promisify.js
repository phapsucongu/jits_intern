/**
 * promisify.js
 * 
 * @description :: Helper to convert callback-style functions to promises
 */

module.exports = {
  friendlyName: 'Promisify',

  description: 'Convert callback-style functions to promises',

  sync: true,

  inputs: {
    fn: {
      type: 'ref',
      description: 'The function to promisify',
      required: true
    },
    ...Array(10).fill().map((_, i) => ({
      [`arg${i}`]: {
        type: 'ref',
        description: `Argument ${i}`,
        required: false
      }
    })).reduce((acc, val) => ({ ...acc, ...val }), {})
  },

  exits: {
    success: {
      description: 'All done.',
    },
    error: {
      description: 'An error occurred during execution.'
    }
  },

  fn: function(inputs, exits) {
    try {
      const { fn, ...args } = inputs;
      const argsArray = Object.values(args).filter(arg => arg !== undefined);
      
      if (typeof fn !== 'function') {
        return exits.error(new Error('First argument must be a function'));
      }
      
      return exits.success(new Promise((resolve, reject) => {
        fn(...argsArray, (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      }));
    } catch (error) {
      return exits.error(error);
    }
  }
};
