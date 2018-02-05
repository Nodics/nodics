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
        let _self = this;
        let modules = NODICS.getModules();
        let routers = SYSTEM.loadFiles('/src/router/router.js');
        _.each(modules, function(value, moduleName) {
            let app = {};
            if (CONFIG.get('server').runAsSingleModule) {
                app = modules.default.app;
            } else {
                app = value.app;
            }
            SERVICE.CacheService.initApplicationCache(moduleName).then(cache => {
                value.apiCache = cache;
                _self.registerRouters(app, value, moduleName, routers);
            }).catch(error => {
                console.log('   ERROR: While configuring api cache : ', error);
                process.exit(CONFIG.get('errorExitCode'));
            });
        });
    },

    registerRouters: function(app, value, moduleName, routers) {
        if (app && value.metaData && value.metaData.publish) {
            // Execute common routers for each required Schema
            _.each(value.rawSchema, (schemaObject, schemaName) => {
                if (schemaObject.service && schemaObject.router) {
                    _.each(routers.default, function(group, groupName) {
                        if (groupName !== 'options') {
                            _.each(group, function(routerDef, routerName) {
                                if (routerName !== 'options') {
                                    let functionName = routerDef.method.toLowerCase();
                                    let tmpRouterDef = _.merge({}, routerDef);
                                    tmpRouterDef.key = tmpRouterDef.key.replaceAll('schemaName', schemaName.toLowerCase());
                                    tmpRouterDef.controller = tmpRouterDef.controller.replaceAll('controllerName', schemaName.toUpperCaseEachWord() + 'Controller');
                                    tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                    tmpRouterDef.moduleName = moduleName;
                                    tmpRouterDef.moduleObject = value;
                                    eval(routers.operations[functionName](app, tmpRouterDef));
                                }
                            });
                        }
                    });
                }
            });
            // Register module common routers, means routers needs to be available in all modules
            if (!UTILS.isBlank(routers.common)) {
                _.each(routers.common, function(group, groupName) {
                    if (groupName !== 'options') {
                        _.each(group, function(routerDef, routerName) {
                            if (routerName !== 'options') {
                                let functionName = routerDef.method.toLowerCase();
                                let tmpRouterDef = _.merge({}, routerDef);
                                tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                tmpRouterDef.moduleName = moduleName;
                                tmpRouterDef.moduleObject = value;
                                eval(routers.operations[functionName](app, tmpRouterDef));
                            }
                        });
                    }
                });
            }
            // Register all module specific routers here
            if (!UTILS.isBlank(routers[moduleName])) {
                _.each(routers[moduleName], function(group, groupName) {
                    if (groupName !== 'options') {
                        _.each(group, function(routerDef, routerName) {
                            if (routerName !== 'options') {
                                let functionName = routerDef.method.toLowerCase();
                                let tmpRouterDef = _.merge({}, routerDef);
                                tmpRouterDef.url = '/' + CONFIG.get('server').contextRoot + '/' + moduleName + tmpRouterDef.key;
                                tmpRouterDef.moduleName = moduleName;
                                tmpRouterDef.moduleObject = value;
                                eval(routers.operations[functionName](app, tmpRouterDef));
                            }
                        });
                    }
                });
            }
        }
    }
};