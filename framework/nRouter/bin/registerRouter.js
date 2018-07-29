/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    init: function () {
        let _self = this;
        let modules = NODICS.getModules();
        let routers = SYSTEM.loadFiles('/src/router/router.js');
        return new Promise((resolve, reject) => {
            _.each(modules, function (moduleObject, moduleName) {
                let app = {};
                if (moduleObject.metaData && moduleObject.metaData.publish) {
                    if (CONFIG.get('server').options.runAsDefault || !moduleObject.app) {
                        app = modules.default.app;
                        SYSTEM.LOG.debug('Found default App for module : ', moduleName);
                    } else {
                        app = moduleObject.app;
                        SYSTEM.LOG.debug('Found module App for module : ', moduleName);
                    }
                    if (!UTILS.isBlank(app)) {
                        try {
                            routers.operations.registerWeb(app, moduleObject);
                            try {
                                SERVICE.DefaultCacheService.initCache(moduleObject, moduleName).then(() => {
                                    _self.registerRouters(app, moduleObject, moduleName, routers);
                                    resolve(true);
                                }).catch(error => {
                                    SYSTEM.LOG.error('got error while initializing cache for module : ', moduleName);
                                    self.registerRouters(app, moduleObject, moduleName, routers);
                                    reject(error);
                                });
                            } catch (error) {
                                SYSTEM.LOG.error('While initializing cache or router registration process for module : ', moduleName);
                                reject(error);
                            }
                        } catch (error) {
                            SYSTEM.LOG.error('While registration process of web path for module : ', moduleName);
                            reject(error);
                        }
                    }
                }
            });
        });
    },

    registerRouters: function (app, moduleObject, moduleName, routers) {
        _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
            if (schemaObject.service && schemaObject.router) {
                _.each(routers.default, function (group, groupName) {
                    if (groupName !== 'options') {
                        _.each(group, function (routerDef, routerName) {
                            if (routerName !== 'options') {
                                let functionName = routerDef.method.toLowerCase();
                                let tmpRouterDef = _.merge({}, routerDef);
                                tmpRouterDef.key = tmpRouterDef.key.replaceAll('schemaName', schemaName.toLowerCase());
                                tmpRouterDef.controller = tmpRouterDef.controller.replaceAll('controllerName', schemaName.toUpperCaseEachWord() + 'Controller');
                                tmpRouterDef.url = '/' + CONFIG.get('server').options.contextRoot + '/' + moduleName + tmpRouterDef.key;
                                tmpRouterDef.moduleName = moduleName;
                                tmpRouterDef.moduleObject = moduleObject;
                                routers.operations[functionName](app, tmpRouterDef);
                            }
                        });
                    }
                });
            }
        });
        // Register module common routers, means routers needs to be available in all modules
        if (!UTILS.isBlank(routers.common)) {
            _.each(routers.common, function (group, groupName) {
                if (groupName !== 'options') {
                    _.each(group, function (routerDef, routerName) {
                        if (routerName !== 'options') {
                            let functionName = routerDef.method.toLowerCase();
                            let tmpRouterDef = _.merge({}, routerDef);
                            tmpRouterDef.url = '/' + CONFIG.get('server').options.contextRoot + '/' + moduleName + tmpRouterDef.key;
                            tmpRouterDef.moduleName = moduleName;
                            tmpRouterDef.moduleObject = moduleObject;
                            routers.operations[functionName](app, tmpRouterDef);
                        }
                    });
                }
            });
        }
        // Register all module specific routers here
        if (!UTILS.isBlank(routers[moduleName])) {
            _.each(routers[moduleName], function (group, groupName) {
                if (groupName !== 'options') {
                    _.each(group, function (routerDef, routerName) {
                        if (routerName !== 'options') {
                            let functionName = routerDef.method.toLowerCase();
                            let tmpRouterDef = _.merge({}, routerDef);
                            tmpRouterDef.url = '/' + CONFIG.get('server').options.contextRoot + '/' + moduleName + tmpRouterDef.key;
                            tmpRouterDef.moduleName = moduleName;
                            tmpRouterDef.moduleObject = moduleObject;
                            routers.operations[functionName](app, tmpRouterDef);
                        }
                    });
                }
            });
        }
    }
};