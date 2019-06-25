
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    serversConfigPool: '',

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    prepareModulesConfiguration: function () {
        return new Promise((resolve, reject) => {
            this.serversConfigPool = new CLASSES.ModulesConfigurationContainer();
            this.serversConfigPool.prepareModulesConfiguration();
            resolve(true);
        });
    },

    getModulesPool: function () {
        return this.serversConfigPool;
    },

    getModuleServerConfig: function (moduleName) {
        if (this.serversConfigPool.isAvailableModuleConfig(moduleName)) {
            return this.serversConfigPool.getModule(moduleName);
        } else {
            return this.serversConfigPool.getModule('default');
        }
    },

    getURL: function (nodeConfig, secured) {
        if (secured) {
            return 'https://' +
                nodeConfig.getHttpHost() +
                ':' +
                nodeConfig.getHttpPort();
        } else {
            return 'http://' +
                nodeConfig.getHttpHost() +
                ':' +
                nodeConfig.getHttpPort();
        }
    },

    prepareUrl: function (options) {
        let url = '';
        try {
            let moduleConfig = this.getModuleServerConfig(options.moduleName);
            let contextRoot = moduleConfig.getOptions().contextRoot || CONFIG.get('server').options.contextRoot;
            if (options.nodeId && options.nodeId > 0) {
                if (moduleConfig.getNode(options.nodeId)) {
                    url = this.getURL(moduleConfig.getNode(options.nodeId));
                } else {
                    this.LOG.error('Invalid node id : ' + options.nodeId + ' while preparing URL for module : ' + options.moduleName);
                }
            } else {
                url = this.getURL(moduleConfig.getAbstractServer());
            }
            url += '/' + contextRoot + '/' + options.moduleName;
        } catch (error) {
            this.LOG.error('While Preparing URL for :' + options.moduleName + ' : ' + error);
        }
        return url;
    },

    registerRouter: function () {
        let _self = this;
        let modules = NODICS.getModules();
        let routers = SERVICE.DefaultFilesLoaderService.loadFiles('/src/router/router.js');
        return new Promise((resolve, reject) => {
            _.each(modules, function (moduleObject, moduleName) {
                let app = {};
                if (moduleObject.metaData && moduleObject.metaData.publish) {
                    if (CONFIG.get('server').options.runAsDefault || !moduleObject.app) {
                        app = modules.default.app;
                        _self.LOG.debug('Found default App for module : ' + moduleName);
                    } else {
                        app = moduleObject.app;
                        _self.LOG.debug('Found module App for module : ' + moduleName);
                    }
                    if (!UTILS.isBlank(app)) {
                        try {
                            routers.operations.registerWeb(app, moduleObject);
                            _self.activateRouters(app, moduleObject, moduleName, routers);
                            resolve(true);
                        } catch (error) {
                            _self.LOG.error('While registration process of web path for module : ' + moduleName);
                            reject(error);
                        }
                    }
                }
            });
        });
    },

    activateRouters: function (app, moduleObject, moduleName, routers) {
        let urlPrefix = moduleObject.metaData.prefix || moduleName;
        _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
            if (schemaObject.service && schemaObject.router) {
                _.each(routers.default, function (group, groupName) {
                    if (groupName !== 'options') {
                        _.each(group, function (routerDef, routerName) {
                            if (routerName !== 'options') {
                                let definition = _.merge({}, routerDef);
                                definition.method = definition.method.toLowerCase();
                                definition.key = definition.key.replaceAll('schemaName', schemaName.toLowerCase());
                                definition.controller = definition.controller.replaceAll('ctrlName', schemaName.toUpperCaseEachWord() + 'Controller');
                                definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + urlPrefix + definition.key;
                                definition.moduleName = moduleName;
                                definition.prefix = schemaName + '_' + routerName;
                                definition.routerName = moduleName + '_' + schemaName + '_' + routerName;
                                definition.routerName = definition.routerName.toLowerCase();
                                definition.cache = _.merge({}, definition.cache || {});
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
                            definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + urlPrefix + definition.key;
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
                            definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + urlPrefix + definition.key;
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
    },

    startServers: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (CONFIG.get('server').options.runAsDefault) {
                    if (!NODICS.getModules().default || !NODICS.getModules().default.app) {
                        _self.LOG.error('Server configurations has not be initialized. Please verify.');
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    let moduleConfig = _self.getModuleServerConfig('default');
                    const httpPort = moduleConfig.getServer().getHttpPort();
                    const httpsPort = moduleConfig.getServer().getHttpsPort();
                    _self.registerListenEvents('default', httpPort, false, http.createServer(NODICS.getModules().default.app)).listen(httpPort);
                    _self.registerListenEvents('default', httpsPort, true, https.createServer(NODICS.getModules().default.app)).listen(httpsPort);
                    moduleConfig.setIsServerRunning(true);
                    resolve(true);
                } else {
                    try {
                        _.each(NODICS.getModules(), function (value, moduleName) {
                            if (value.metaData && value.metaData.publish) {
                                let app = {};
                                let moduleConfig;
                                if (_self.getModulesPool().isAvailableModuleConfig(moduleName)) {
                                    moduleConfig = _self.getModuleServerConfig(moduleName);
                                    app = value.app;
                                } else {
                                    moduleConfig = _self.getModuleServerConfig('default');
                                    app = NODICS.getModules().default.app;
                                }
                                const httpPort = moduleConfig.getServer().getHttpPort();
                                const httpsPort = moduleConfig.getServer().getHttpsPort();
                                if (!httpPort) {
                                    _self.LOG.error('Please define listening PORT for module: ' + moduleName);
                                    process.exit(CONFIG.get('errorExitCode'));
                                }
                                if (!moduleConfig.isServerRunning()) {
                                    _self.registerListenEvents(moduleName, httpPort, false, http.createServer(app)).listen(httpPort);
                                    _self.registerListenEvents(moduleName, httpsPort, true, https.createServer(app)).listen(httpsPort);
                                    moduleConfig.setIsServerRunning(true);
                                }
                            }
                        });
                        resolve(true);
                    } catch (err) {
                        reject(err);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    registerListenEvents: function (moduleName, port, isSecure, server) {
        let _self = this;
        server.on('error', function (error) {
            if (isSecure) {
                _self.LOG.error('Failed to start HTTPS Server for module : ' + moduleName + ' on PORT : ' + port);
            } else {
                _self.LOG.error('Failed to start HTTP Server for module : ' + moduleName + ' on PORT : ' + port);
            }
        });
        server.on('listening', function () {
            if (isSecure) {
                _self.LOG.info('Starting HTTPS Server for module : ' + moduleName + ' on PORT : ' + port);
            } else {
                _self.LOG.info('Starting HTTP Server for module : ' + moduleName + ' on PORT : ' + port);
            }
        });
        return server;
    },
};