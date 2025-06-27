module.exports = {
    friendlyName: 'Ping',
    description: 'Ping the server to check if it is running.',
    inputs: {},
    exits: {
        success: {
            description: 'pong',
            responseType: 'ok'
        },
        error: {
            description: 'An unexpected error occurred.',
            responseType: 'serverError'
        }
    },  
    fn: async function (inputs, exits) {
        try {
            return exits.success({ message: 'pong' });
        } catch (error) {
            return exits.error(error);
        }
    }
};