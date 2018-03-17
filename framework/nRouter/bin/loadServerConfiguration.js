/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    init: function() {
        SYSTEM.LOG.info(' =>Starting server configuration');
        let modules = NODICS.getModules();
        let commonConfig = SYSTEM.loadFiles('/src/router/appConfig.js');
        if (CONFIG.get('server').runAsSingleModule) {
            if (!modules.default || !modules.default.app) {
                console.error('   ERROR: Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.get('errorExitCode'));
            }
            SYSTEM.LOG.info('   INFO: Configuring Default App');
            SYSTEM.LOG.info('     INFO: Executing common configurations');
            SYSTEM.executeRouterConfig(modules.default.app, commonConfig.default);
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    //let moduleConfig = SYSTEM.loadFiles('/src/router/' + commonConfig[moduleName] + 'AppConfig.js');
                    if (commonConfig[moduleName] && !UTILS.isBlank(commonConfig[moduleName])) {
                        SYSTEM.LOG.info('     INFO: Executing module configurations :', moduleName);
                        SYSTEM.executeRouterConfig(modules.default.app, commonConfig[moduleName]);
                    }
                }
            });
        } else {
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (!value.app) {
                        SYSTEM.LOG.error('   ERROR: Server configurations has not be initialized for module : ', moduleName);
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    SYSTEM.LOG.info('   INFO: Configuring App from module : ', moduleName);
                    SYSTEM.LOG.info('     INFO: Executing common configurations');
                    SYSTEM.executeRouterConfig(value.app, commonConfig.default);
                    if (commonConfig[moduleName] && !UTILS.isBlank(commonConfig[moduleName])) {
                        SYSTEM.LOG.info('     INFO: Executing module configurations :', moduleName);
                        SYSTEM.executeRouterConfig(value.app, commonConfig[moduleName]);
                    }
                }
            });
        }
    }
};