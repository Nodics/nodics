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
        SYSTEM.LOG.debug('Starting server configuration');
        let modules = NODICS.getModules();
        let commonConfig = SYSTEM.loadFiles('/src/router/appConfig.js');

        if (modules.default && modules.default.app) {
            SYSTEM.LOG.debug('Configuring Default App');
            SYSTEM.LOG.debug('  Executing common configurations');
            SYSTEM.executeRouterConfig(modules.default.app, commonConfig.default);
        }

        if (CONFIG.get('server').options.runAsDefault) {
            if (!modules.default || !modules.default.app) {
                SYSTEM.LOG.error('Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.get('errorExitCode'));
            }
            _.each(modules, function (value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (commonConfig[moduleName] && !UTILS.isBlank(commonConfig[moduleName])) {
                        SYSTEM.LOG.debug('  Executing module configurations :', moduleName);
                        SYSTEM.executeRouterConfig(modules.default.app, commonConfig[moduleName]);
                    }
                }
            });
        } else {
            _.each(modules, function (value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (commonConfig[moduleName] && !UTILS.isBlank(commonConfig[moduleName])) {
                        if (value.app) {
                            SYSTEM.LOG.debug('Configuring App from module : ', moduleName);
                            SYSTEM.LOG.debug('  Executing common configurations');
                            SYSTEM.executeRouterConfig(value.app, commonConfig.default);
                            SYSTEM.LOG.debug('  Executing module specific configurations for :', moduleName, ' with : ', moduleName);
                            SYSTEM.executeRouterConfig(value.app, commonConfig[moduleName]);
                        } else if (modules.default && modules.default.app) {
                            SYSTEM.LOG.debug('Executing module specific configurations for :', moduleName, ' with : default');
                            SYSTEM.executeRouterConfig(modules.default.app, commonConfig[moduleName]);
                        } else {
                            SYSTEM.LOG.error('Could not found app configuration for module : ', moduleName);
                            throw new Error('Could not found app configuration for module : ' + moduleName);
                        }
                    }
                }
            });
        }
    }
};