let requestPromise = require('request-promise');
const request = require('request');

module.exports = {
    prepareConnectionUrl: function(moduleName) {
        let moduleServerConfiguration = CONFIG.get('server')[moduleName];
        if (!moduleServerConfiguration || CONFIG.get('server').runAsSingleModule) {
            moduleServerConfiguration = CONFIG.get('server').default;
        }
        return 'http://' + moduleServerConfiguration.httpServer + ':' + moduleServerConfiguration.httpPort + '/' + CONFIG.get('server').contextRoot;
    },

    prepareSecureConnectionUrl: function(moduleName) {
        let moduleServerConfiguration = CONFIG.get('server')[moduleName];
        if (!moduleServerConfiguration || CONFIG.get('server').runAsSingleModule) {
            moduleServerConfiguration = CONFIG.get('server').default;
        }
        return 'https://' + moduleServerConfiguration.httpsServer + ':' + moduleServerConfiguration.httpsPort + '/' + CONFIG.get('server').contextRoot;
    },
};