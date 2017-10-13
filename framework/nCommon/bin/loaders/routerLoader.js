const fs = require('fs');
var _ = require('lodash');

module.exports = {
    loadModuleRouterConfig: function(module, app) {
        let configPath = module.path + '/src/router/appConfig.js';
        if (fs.existsSync(configPath)) {
            console.log('Loading router config from ', configPath);
            SYSTEM.executeRouterConfig(app, require(configPath));
        }
    },

    registerModuleRouters: function(module, app) {
        let configPath = module.path + '/src/router/router.js';
        if (fs.existsSync(configPath)) {
            console.log('++++ Loading routers from ', configPath);
            UTILS.executeFunctions(require(configPath), app);
        }
    },

    loadRouters: function(module) {
        if (API[module.name] && API[module.name].app) {
            console.log('### Starting App Server initialization process for : ', module.name);
            this.loadModuleRouterConfig(module, API[module.name].app);
            this.registerModuleRouters(module, API[module.name].app);
        }
    }
};