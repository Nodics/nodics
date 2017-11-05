/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const _ = require('lodash');

module.exports = {
    //This router loader is not getting used anywhere
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
            console.log('=> Starting App Server initialization process for : ', module.name);
            this.loadModuleRouterConfig(module, API[module.name].app);
            this.registerModuleRouters(module, API[module.name].app);
        }
    }
};