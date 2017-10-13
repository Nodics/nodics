let requestPromise = require('request-promise');
const request = require('request');

module.exports = {
    prepareConnectionUrl: function (moduleName) {
        let moduleServerConfiguration = CONFIG.server[moduleName];
        if (moduleServerConfiguration) {
            return 'http://' + moduleServerConfiguration.httpDaoServer + ':' + moduleServerConfiguration.httpDaoPort + '/' + CONFIG.daoAPIContextRoot;
        } else {
            console.error('Dao API configuration not found for module : ', moduleName);
        }
    },

    prepareSecureConnectionUrl: function (moduleName) {
        let moduleServerConfiguration = CONFIG.server[moduleName];
        if (moduleServerConfiguration) {
            return 'https://' + moduleServerConfiguration.httpsDaoServer + ':' + moduleServerConfiguration.httpsDaoPort + '/' + CONFIG.daoAPIContextRoot;
        } else {
            console.error('Dao API configuration not found for module : ', moduleName);
        }
    },

    callDaoAPI: function (options) {
        return requestPromise(options);
    },

    getQueryPromise: function (queryOptions, resolve, reject) {
        return request(queryOptions,
            (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            });
    }
}