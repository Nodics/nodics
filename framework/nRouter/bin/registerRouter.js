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
                                let cachePromises = [
                                    SERVICE.DefaultCacheService.initApiCache(moduleObject, moduleName),
                                    SERVICE.DefaultCacheService.initItemCache(moduleObject, moduleName)
                                ];
                                if (moduleName === CONFIG.get('profileModuleName')) {
                                    cachePromises.push(SERVICE.DefaultCacheService.initAuthCache(moduleObject, moduleName));
                                }
                                if (cachePromises.length > 0) {
                                    Promise.all(cachePromises).then(success => {
                                        _self.registerRouters(app, moduleObject, moduleName, routers);
                                        resolve(true);
                                    }).catch(error => {
                                        SYSTEM.LOG.error('got error while initializing cache for module : ', moduleName);
                                        _self.registerRouters(app, moduleObject, moduleName, routers);
                                        resolve(true);
                                    });
                                } else {
                                    _self.registerRouters(app, moduleObject, moduleName, routers);
                                    resolve(true);
                                }
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
                                let definition = _.merge({}, routerDef);
                                definition.method = definition.method.toLowerCase();
                                definition.key = definition.key.replaceAll('schemaName', schemaName.toLowerCase());
                                definition.controller = definition.controller.replaceAll('controllerName', schemaName.toUpperCaseEachWord() + 'Controller');
                                definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + moduleName + definition.key;
                                definition.moduleName = moduleName;
                                definition.prefix = routerName + '_' + schemaName;
                                definition.routerName = moduleName + '_' + routerName + '_' + schemaName;
                                definition.routerName = definition.routerName.toLowerCase();
                                definition.cache = definition.cache || {};
                                let routerLevelCache = CONFIG.get('cache').routerLevelCache;
                                if (routerLevelCache &&
                                    routerLevelCache[schemaName] &&
                                    routerLevelCache[schemaName][definition.method]) {
                                    definition.cache = _.merge(definition.cache, routerLevelCache[schemaName][definition.method]);
                                }
                                NODICS.addRouter(definition.routerName, definition, moduleName);
                                routers.operations[definition.method](app, definition);
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
                            let definition = _.merge({}, routerDef);
                            definition.method = definition.method.toLowerCase();
                            definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + moduleName + definition.key;
                            definition.moduleName = moduleName;
                            definition.prefix = routerName;
                            definition.routerName = moduleName + '_' + routerName;
                            definition.routerName = definition.routerName.toLowerCase();
                            NODICS.addRouter(definition.routerName, definition, moduleName);
                            routers.operations[definition.method](app, definition);
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
                            let definition = _.merge({}, routerDef);
                            definition.method = definition.method.toLowerCase();
                            definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + moduleName + definition.key;
                            definition.moduleName = moduleName;
                            definition.prefix = routerName;
                            definition.routerName = moduleName + '_' + routerName;
                            definition.routerName = definition.routerName.toLowerCase();
                            NODICS.addRouter(definition.routerName, definition, moduleName);
                            routers.operations[definition.method](app, definition);
                        }
                    });
                }
            });
        }
    }
};