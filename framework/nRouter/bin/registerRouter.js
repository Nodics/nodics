/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    init: function() {
        let modules = NODICS.getModules();
        let routers = SYSTEM.loadFiles('/src/router/router.js');
        _.each(modules, function(value, moduleName) {
            let app = {};
            if (CONFIG.get('server').runAsSingleModule) {
                app = modules.default.app;
            } else {
                app = value.app;
            }

            if (app && value.metaData && value.metaData.publish) {
                // Execute common routers for each required Schema
                _.each(value.rawSchema, (schemaObject, schemaName) => {
                    if (schemaObject.service) {
                        _.each(routers.default, function(group, groupName) {
                            _.each(group, function(routerDef, routerName) {
                                let functionName = routerDef.method.toLowerCase();
                                let tmpRouterDef = _.merge({}, routerDef);
                                tmpRouterDef.key = tmpRouterDef.key.replaceAll('schemaName', schemaName.toLowerCase());
                                tmpRouterDef.controller = tmpRouterDef.controller.replaceAll('controllerName', schemaName.toUpperCaseEachWord() + 'Controller');
                                tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                eval(routers.operations[functionName](app, moduleName, tmpRouterDef));
                            });
                        });
                    }
                });
                // Register module common routers, means routers needs to be available in all modules
                if (!UTILS.isBlank(routers.common)) {
                    _.each(routers.common, function(group, groupName) {
                        _.each(group, function(routerDef, routerName) {
                            let functionName = routerDef.method.toLowerCase();
                            let tmpRouterDef = _.merge({}, routerDef);
                            tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                            console.log(' -------------------------- Registering URL : ', tmpRouterDef.url);
                            eval(routers.operations[functionName](app, moduleName, tmpRouterDef));
                        });
                    });
                }
                // Register all module specific routers here
                if (!UTILS.isBlank(routers[moduleName])) {
                    _.each(routers[moduleName], function(group, groupName) {
                        _.each(group, function(routerDef, routerName) {
                            let functionName = routerDef.method.toLowerCase();
                            let tmpRouterDef = _.merge({}, routerDef);
                            tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                            eval(routers.operations[functionName](app, moduleName, tmpRouterDef));
                        });
                    });
                }
            }
        });
    }
};