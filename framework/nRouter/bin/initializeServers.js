const _ = require('lodash');

module.exports = {
    init: function() {
        console.log(' =>Initializing servers');
        let modules = NODICS.modules;
        if (CONFIG.server.runAsSingleModule) {
            console.log('   INFO: Initializing single server for whole application. As CONFIG.server.runAsSingleModule set to true.');
            NODICS.modules.default = {};
            NODICS.modules.default.app = require('express')();
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