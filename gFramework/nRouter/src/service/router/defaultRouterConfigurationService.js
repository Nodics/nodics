/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

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

        if (CONFIG.get('server').options.runAsDefault) {
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
    }
};