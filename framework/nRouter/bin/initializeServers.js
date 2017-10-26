const _ = require('lodash');

module.exports = {
    init: function() {
        console.log(' =>Initializing servers');
        let modules = NODICS.getModules();
        if (CONFIG.get('server').runAsSingleModule) {
            console.log('   INFO: Initializing single server for whole application. As CONFIG.server.runAsSingleModule set to true.');
            modules.default = {};
            modules.default.app = require('express')();
        } else {
            _.each(modules, function(value, moduleName) {
                if (value.metaData.publish) {
                    console.log('   INFO: Initializing server for module : ', moduleName);
                    value.app = require('express')();
                }
            });
        }
    }
};