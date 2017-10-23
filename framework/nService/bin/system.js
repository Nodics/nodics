let requestPromise = require('request-promise');
const request = require('request');

module.exports = {
    prepareConnectionUrl: function(moduleName) {
        let moduleServerConfiguration = CONFIG.server[moduleName];
        if (!moduleServerConfiguration || CONFIG.server.runAsSingleModule) {
            moduleServerConfiguration = CONFIG.server['default'];
        }
        return 'http://' + moduleServerConfiguration.httpServer + ':' + moduleServerConfiguration.httpPort + '/' + CONFIG.server.contextRoot;
    },

    prepareSecureConnectionUrl: function(moduleName) {
        let moduleServerConfiguration = CONFIG.server[moduleName];
        if (!moduleServerConfiguration || CONFIG.server.runAsSingleModule) {
            moduleServerConfiguration = CONFIG.server['default'];
        }
        return 'https://' + moduleServerConfiguration.httpsServer + ':' + moduleServerConfiguration.httpsPort + '/' + CONFIG.server.contextRoot;
    },
    /*
        callDaoAPI: function(options) {
            return requestPromise(options);
        },

        getQueryPromise: function(queryOptions, resolve, reject) {
            return request(queryOptions,
                (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(body);
                    }
                });
        }
    */
};