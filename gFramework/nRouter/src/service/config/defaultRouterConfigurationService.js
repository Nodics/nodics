/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module router/service/config/DefaultRouterConfigurationService
 * @description Holds and applies effective router configuration for the active Nodics
 * module hierarchy. It executes layered app configuration scripts and exposes the
 * merged router definitions used by router registration.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this service to load routers from persisted
 * control-plane configuration or to change app configuration sequencing.
 *
 * @property {Object} rawRouters Effective router definitions merged from active modules.
 * @property {Object} SERVICE.DefaultFilesLoaderService Loads layered router app configuration files.
 */
module.exports = {

    /**
     * Effective router definitions for default, common, and module-specific routes.
     *
     * @type {Object}
     */
    rawRouters: {},

    /**
     * Returns effective raw router definitions.
     *
     * @returns {Object} Current effective router definition map.
     */
    getRawRouters: function () {
        return this.rawRouters;
    },

    /**
     * Replaces effective raw router definitions.
     *
     * @param {Object} rawRouters Merged router definitions from active module hierarchy.
     * @returns {void}
     * @sideEffects Updates in-memory router definition state.
     */
    setRawRouters: function (rawRouters) {
        this.rawRouters = rawRouters;
    },

    /**
     * Executes supported Express app configuration hooks in deterministic order.
     *
     * @param {Object} app Express application instance.
     * @param {Object} scripts Layered router app configuration object.
     * @returns {void}
     * @sideEffects Mutates Express app by applying properties, sessions, logging, cache, body parsing, headers, errors, and extras.
     */
    executeRouterConfig: function (app, scripts) {
        if (scripts.initProperties && typeof scripts.initProperties === "function") {
            scripts.initProperties(app);
        }
        if (scripts.initSession && typeof scripts.initSession === "function") {
            scripts.initSession(app);
        }
        if (scripts.initLogger && typeof scripts.initLogger === "function") {
            scripts.initLogger(app);
        }
        if (scripts.initCache && typeof scripts.initCache === "function") {
            scripts.initCache(app);
        }
        if (scripts.initBodyParser && typeof scripts.initBodyParser === "function") {
            scripts.initBodyParser(app);
        }
        if (scripts.initHeaders && typeof scripts.initHeaders === "function") {
            scripts.initHeaders(app);
        }
        if (scripts.initErrorRoutes && typeof scripts.initErrorRoutes === "function") {
            scripts.initErrorRoutes(app);
        }
        if (scripts.initExtras && typeof scripts.initExtras === "function") {
            scripts.initExtras(app);
        }
    },

    /**
     * Applies effective app configuration to default or module-specific Express apps.
     *
     * @returns {void}
     * @sideEffects Executes layered `src/router/appConfig.js` hooks against runtime Express apps.
     * @throws Exits or throws when required server app configuration cannot be resolved.
     */
    configureRouters: function () {
        let _self = this;
        _self.LOG.debug('Starting server configuration');
        let modules = NODICS.getModules();
        let commonConfig = SERVICE.DefaultFilesLoaderService.loadFiles('/src/router/appConfig.js');

        if (modules.default && modules.default.app) {
            _self.LOG.debug('Configuring Default App');
            _self.LOG.debug('  Executing common configurations');
            _self.executeRouterConfig(modules.default.app, commonConfig.default);
        }

        if (CONFIG.get('servers').options.runAsDefault) {
            if (!modules.default || !modules.default.app) {
                _self.LOG.error('Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.get('errorExitCode'));
            }
            _.each(modules, function (value, moduleName) {
                if (UTILS.isRouterEnabled(moduleName)) {
                    if (commonConfig[moduleName] && !UTILS.isBlank(commonConfig[moduleName])) {
                        _self.LOG.debug('  Executing module configurations :' + moduleName);
                        _self.executeRouterConfig(modules.default.app, commonConfig[moduleName]);
                    }
                }
            });
        } else {
            _.each(modules, function (value, moduleName) {
                if (UTILS.isRouterEnabled(moduleName)) {
                    if (commonConfig[moduleName] && !UTILS.isBlank(commonConfig[moduleName])) {
                        if (value.app) {
                            _self.LOG.debug('Configuring App from module : ' + moduleName);
                            _self.LOG.debug('  Executing common configurations');
                            _self.executeRouterConfig(value.app, commonConfig.default);
                            _self.LOG.debug('  Executing module specific configurations for :' + moduleName + ' with : ' + moduleName);
                            _self.executeRouterConfig(value.app, commonConfig[moduleName]);
                        } else if (modules.default && modules.default.app) {
                            _self.LOG.debug('Executing module specific configurations for :' + moduleName + ' with : default');
                            _self.executeRouterConfig(modules.default.app, commonConfig[moduleName]);
                        } else {
                            _self.LOG.error('Could not found app configuration for module : ' + moduleName);
                            throw new Error('Could not found app configuration for module : ' + moduleName);
                        }
                    }
                }
            });
        }
    },

    /**
     * Placeholder for future persisted router loading from control-plane storage.
     *
     * @returns {Promise<boolean>} Resolves because router persistence is currently disabled.
     * @override Project modules may provide persisted route loading without changing nRouter core.
     */
    loadPersistedRouters: function () {
        this.LOG.warn('Persisted router loading skipped; no router configuration model service is available');
        return Promise.resolve(true);
    }
};
