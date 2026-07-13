/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const Express = require('express');
const http = require('http');
const https = require('https');

/**
 * @module router/service/router/DefaultRouterService
 * @description Builds and starts Nodics API routing from the effective module hierarchy.
 * It prepares module server configuration, generates schema-driven default routers,
 * registers common and module-specific routers, and starts HTTP/HTTPS listeners for
 * consolidated or modular runtime topologies.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this service to change router generation,
 * URL construction, module-server selection, validation rules, or server startup behavior.
 *
 * @property {Object} CLASSES.ModulesConfigurationContainer Module/server/node configuration container.
 * @property {Object} CONFIG Runtime configuration registry used for server context root, cache, and exit code.
 * @property {Object} NODICS Runtime registry for modules and effective routers.
 * @property {Object} SERVICE.DefaultRouterConfigurationService Supplies effective router definitions.
 * @property {Object} SERVICE.DefaultRouterOperationService Binds prepared router definitions to Express.
 * @property {Object} serversConfigPool Prepared module server configuration container.
 */
module.exports = {

    /**
     * Prepared module/server/node configuration container used for URL resolution and server startup.
     *
     * @type {Object|string}
     */
    serversConfigPool: '',

    /**
     * Initializes the router service during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the router service after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Builds the module/server/node configuration pool for the selected runtime hierarchy.
     *
     * @returns {Promise<boolean>} Resolves after module configuration is prepared.
     * @sideEffects Replaces `serversConfigPool` with a prepared `ModulesConfigurationContainer`.
     */
    prepareModulesConfiguration: function () {
        return new Promise((resolve, reject) => {
            this.serversConfigPool = new CLASSES.ModulesConfigurationContainer();
            this.serversConfigPool.prepareModulesConfiguration();
            resolve(true);
        });
    },

    /**
     * Returns the prepared module configuration container.
     *
     * @returns {Object|string} Prepared module/server/node configuration container.
     */
    getModulesPool: function () {
        return this.serversConfigPool;
    },

    /**
     * Returns module-specific server configuration or falls back to default consolidated configuration.
     *
     * @param {string} moduleName Logical module name.
     * @returns {Object} Module server configuration object.
     */
    getModuleServerConfig: function (moduleName) {
        if (this.serversConfigPool.isAvailableModuleConfig(moduleName)) {
            return this.serversConfigPool.getModule(moduleName);
        } else {
            return this.serversConfigPool.getModule('default');
        }
    },

    /**
     * Builds the base HTTP or HTTPS URL for a node configuration.
     *
     * @param {Object} nodeConfig Node/server configuration with host and port accessors.
     * @param {boolean} secured Whether to build HTTPS URL.
     * @returns {string} Base URL for the node.
     */
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

    /**
     * Prepares a module API base URL for internal module-to-module communication.
     *
     * @param {Object} options URL preparation options.
     * @param {string} options.moduleName Logical module name.
     * @param {string|number} [options.nodeId] Optional target node id.
     * @returns {string} API base URL containing context root and module name.
     */
    prepareUrl: function (options) {
        let url = '';
        try {
            let moduleConfig = this.getModuleServerConfig(options.moduleName);
            let contextRoot = moduleConfig.getOptions().contextRoot || CONFIG.get('server').options.contextRoot;
            if (options.nodeId === undefined) {
                url = this.getURL(moduleConfig.getAbstractServer());
            } else {
                if (moduleConfig.getNode(options.nodeId)) {
                    url = this.getURL(moduleConfig.getNode(options.nodeId));
                } else {
                    this.LOG.error('Invalid node id : ' + options.nodeId + ' while preparing URL for module : ' + options.moduleName);
                }
            }
            url += '/' + contextRoot + '/' + options.moduleName;
        } catch (error) {
            this.LOG.error('While Preparing URL for :' + options.moduleName + ' : ', error);
        }
        return url;
    },

    /**
     * Registers all active routers for router-enabled modules.
     *
     * @param {Object} [routers] Effective router definitions; defaults to router configuration service output.
     * @returns {Promise<boolean>} Resolves after all routers are registered.
     * @sideEffects Adds route definitions to `NODICS`, binds routes to Express routers, and exits process on registration failure.
     */
    registerRouter: function (routers) {
        let _self = this;
        let modules = NODICS.getModules();
        routers = routers || SERVICE.DefaultRouterConfigurationService.getRawRouters();
        return new Promise((resolve, reject) => {
            _.each(modules, (moduleObject, moduleName) => {
                let app = {};
                let moduleRouter = {};
                if (UTILS.isRouterEnabled(moduleName)) {
                    app = moduleObject.app || modules.default.app;
                    moduleRouter = moduleObject.moduleRouter || modules.default.moduleRouter;
                    try {
                        _self.activateRouters(moduleRouter, moduleObject, moduleName, routers);
                    } catch (error) {
                        _self.LOG.error('While registration process of router path for module : ' + moduleName);
                        _self.LOG.error(error);
                        process.exit(1);
                    }
                }
            });
            resolve(true);
        });
    },

    /**
     * Activates schema-generated, common, and module-specific routers for a module.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} moduleObject Runtime module definition containing metadata and effective schema.
     * @param {string} moduleName Logical module name.
     * @param {Object} routers Effective router definitions grouped by default/common/module.
     * @returns {void}
     * @sideEffects Registers generated and configured router definitions in `NODICS`.
     */
    activateRouters: function (moduleRouter, moduleObject, moduleName, routers) {
        let _self = this;
        let urlPrefix = moduleObject.metaData.prefix || moduleName;
        if (routers.default) {
            _.each(moduleObject.rawSchema, (schemaObject, schemaName) => {
                if (schemaObject.service && schemaObject.service.enabled &&
                    schemaObject.router && schemaObject.router.enabled &&
                    (!schemaObject.router.target || schemaObject.router.target === moduleName)) {
                    _self.prepareDefaultRouter({
                        routers: routers,
                        urlPrefix: urlPrefix,
                        alias: schemaObject.router.alias || schemaName,
                        schemaName: schemaName,
                        moduleName: moduleName,
                        moduleRouter: moduleRouter
                    });
                }
            });
            let modules = NODICS.getModules();
            _.each(modules, (cModuleObject, cModuleName) => {
                _.each(cModuleObject.rawSchema, (cSchemaObject, cSchemaName) => {
                    if (cSchemaObject.service && cSchemaObject.service.enabled &&
                        cSchemaObject.router && cSchemaObject.router.enabled &&
                        cSchemaObject.router.target && cSchemaObject.router.target === moduleName && cSchemaObject.router.target !== cModuleName) {
                        _self.prepareDefaultRouter({
                            routers: routers,
                            urlPrefix: urlPrefix,
                            alias: cSchemaObject.router.alias || cSchemaName,
                            schemaName: cSchemaName,
                            moduleName: moduleName,
                            moduleRouter: moduleRouter
                        });
                    }
                });
            });
        }
        // Register module common routers, means routers needs to be available in all modules
        if (!UTILS.isBlank(routers.common)) {
            _.each(routers.common, function (group, groupName) {
                if (groupName !== 'options') {
                    _.each(group, function (routerDef, routerName) {
                        if (routerName !== 'options' && _self.validateRouterDefinition(routerName, routerDef)) {
                            _self.prepareRouter({
                                routerName: routerName,
                                routerDef: routerDef,
                                urlPrefix: urlPrefix,
                                moduleName: moduleName,
                                moduleRouter: moduleRouter
                            });
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
                        if (routerName !== 'options' && _self.validateRouterDefinition(routerName, routerDef)) {
                            _self.prepareRouter({
                                routerName: routerName,
                                routerDef: routerDef,
                                urlPrefix: urlPrefix,
                                moduleName: moduleName,
                                moduleRouter: moduleRouter
                            });
                        }
                    });
                }
            });
        }
    },

    /**
     * Creates CRUD-style default routers from a schema and default router template.
     *
     * @param {Object} options Default router preparation options.
     * @param {Object} options.routers Effective router definitions.
     * @param {string} options.urlPrefix Module URL prefix.
     * @param {string} options.alias Public schema route alias.
     * @param {string} options.schemaName Logical schema name.
     * @param {string} options.moduleName Target runtime module name.
     * @param {Object} options.moduleRouter Express router for the module.
     * @returns {void}
     * @sideEffects Adds default routers to `NODICS` and binds them to Express.
     */
    prepareDefaultRouter: function (options) {
        let _self = this;
        _.each(options.routers.default, function (group, groupName) {
            if (groupName !== 'options') {
                _.each(group, function (routerDef, routerName) {
                    if (routerName !== 'options' && _self.validateRouterDefinition(routerName, routerDef)) {
                        let definition = _.merge({}, routerDef);
                        definition.method = definition.method.toLowerCase();
                        definition.key = definition.key.replaceAll('schemaName', options.alias.toLowerCase());
                        definition.controller = definition.controller.replaceAll('ctrlName', options.schemaName.toUpperCaseEachWord() + 'Controller');
                        definition.apiVersion = definition.apiVersion ? definition.apiVersion : 'v0';
                        definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + options.urlPrefix + '/' + definition.apiVersion + definition.key;
                        definition.active = (definition.active === undefined) ? true : definition.active;
                        definition.moduleName = options.moduleName;
                        definition.prefix = options.schemaName + '_' + routerName;
                        definition.routerName = options.moduleName + '_' + options.schemaName + '_' + routerName;
                        definition.routerName = definition.routerName.toLowerCase();
                        definition.cache = _.merge({}, definition.cache || {});
                        let routerLevelCache = CONFIG.get('cache').routerLevelCache;
                        if (routerLevelCache &&
                            routerLevelCache[options.schemaName] &&
                            routerLevelCache[options.schemaName][definition.method]) {
                            definition.cache = _.merge(definition.cache, routerLevelCache[options.schemaName][definition.method]);
                        }

                        NODICS.addRouter(definition.routerName, definition, options.moduleName);
                        SERVICE.DefaultRouterOperationService[definition.method](options.moduleRouter, definition);
                    }
                });
            }
        });
    },

    /**
     * Creates a configured common or module-specific router definition.
     *
     * @param {Object} options Router preparation options.
     * @param {string} options.routerName Router name from configuration.
     * @param {Object} options.routerDef Router definition from effective configuration.
     * @param {string} options.urlPrefix Module URL prefix.
     * @param {string} options.moduleName Logical module name.
     * @param {Object} options.moduleRouter Express router for the module.
     * @returns {void}
     * @sideEffects Adds router to `NODICS` and binds it to Express.
     */
    prepareRouter: function (options) {
        let definition = _.merge({}, options.routerDef);
        definition.method = definition.method.toLowerCase();
        definition.apiVersion = definition.apiVersion ? definition.apiVersion : 'v0';
        definition.url = '/' + CONFIG.get('server').options.contextRoot + '/' + options.urlPrefix + '/' + definition.apiVersion + definition.key;
        definition.active = (definition.active === undefined) ? true : definition.active;
        definition.moduleName = options.moduleName;
        definition.prefix = options.routerName;
        definition.routerName = options.moduleName + '_' + options.routerName;
        definition.routerName = definition.routerName.toLowerCase();
        NODICS.addRouter(definition.routerName, definition, options.moduleName);
        SERVICE.DefaultRouterOperationService[definition.method](options.moduleRouter, definition);
    },

    /**
     * Validates minimum route security metadata before binding a router.
     *
     * @param {string} routerName Logical router name.
     * @param {Object} routerDef Effective router definition.
     * @returns {boolean} True when router definition can be registered.
     * @throws {Object} Nodics error when `accessGroups` is missing or empty.
     */
    validateRouterDefinition: function (routerName, routerDef) {
        if (routerDef && routerDef.accessGroups && routerDef.accessGroups.length > 0) {
            return true;
        } else {
            throw new CLASSES.NodicsError('Invalid router definition: accessGroups is not valid for: ' + routerName);
        }
    },

    /**
     * Starts HTTP and HTTPS listeners for the selected consolidated or modular topology.
     *
     * @returns {Promise<boolean>} Resolves after listener startup has been attempted for all router-enabled modules.
     * @sideEffects Attaches Express routers to apps, starts HTTP/HTTPS servers, and marks module server config as running.
     * @throws Rejects with startup errors not handled by listener events.
     */
    startServers: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _.each(NODICS.getModules(), function (moduleObject, moduleName) {
                    if (UTILS.isRouterEnabled(moduleName)) {
                        let app = {};
                        let moduleConfig;
                        let displayName = null;
                        if (_self.getModulesPool().isAvailableModuleConfig(moduleName)) {
                            moduleConfig = _self.getModuleServerConfig(moduleName);
                            app = moduleObject.app;
                            app.use('/', moduleObject.moduleRouter);
                            displayName = moduleName;
                        } else {
                            moduleConfig = _self.getModuleServerConfig('default');
                            app = NODICS.getModules().default.app;
                            app.use('/', NODICS.getModules().default.moduleRouter);
                            displayName = 'default';
                        }
                        const httpPort = moduleConfig.getServer().getHttpPort();
                        const httpsPort = moduleConfig.getServer().getHttpsPort();
                        if (!httpPort) {
                            _self.LOG.error('Please define listening PORT for module: ' + moduleName);
                            process.exit(CONFIG.get('errorExitCode'));
                        }
                        if (!moduleConfig.isServerRunning()) {
                            _self.registerListenEvents(displayName, httpPort, false, http.createServer(app)).listen(httpPort);
                            _self.registerListenEvents(displayName, httpsPort, true, https.createServer(app)).listen(httpsPort);
                            moduleConfig.setIsServerRunning(true);
                        }
                    }
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Registers logging callbacks for server error and listening events.
     *
     * @param {string} moduleName Display module name for startup logs.
     * @param {number|string} port Port being listened on.
     * @param {boolean} isSecure Whether this server is HTTPS.
     * @param {Object} server Node HTTP/HTTPS server instance.
     * @returns {Object} Same server instance with registered listeners.
     */
    registerListenEvents: function (moduleName, port, isSecure, server) {
        let _self = this;
        server.on('error', function (error) {
            if (isSecure) {
                _self.LOG.error('Failed to start HTTPS Server for module : ' + moduleName + ' on PORT : ' + port);
            } else {
                _self.LOG.error('Failed to start HTTP Server for module : ' + moduleName + ' on PORT : ' + port);
            }
            _self.LOG.error(error);
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
