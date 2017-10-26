const _ = require('lodash');

module.exports = {
    init: function() {
        console.log(' =>Starting server configuration');
        let modules = NODICS.getModules();
        let commonConfig = SYSTEM.loadFiles(CONFIG.getProperties(), '/src/router/commonAppConfig.js');
        if (CONFIG.get('server').runAsSingleModule) {
            if (!modules.default || !modules.default.app) {
                console.error('   ERROR: Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.get('errorExitCode'));
            }
            console.log('   INFO: Configuring Default App');
            console.log('     INFO: Executing common configurations');
            SYSTEM.executeRouterConfig(modules.default.app, commonConfig);
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    let moduleConfig = SYSTEM.loadFiles(CONFIG.getProperties(), '/src/router/' + moduleName + 'AppConfig.js');
                    if (moduleConfig != null && moduleConfig) {
                        console.log('     INFO: Executing module configurations :', moduleName);
                        SYSTEM.executeRouterConfig(modules.default.app, moduleConfig);
                    }
                }
            });
        } else {
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (!value.app) {
                        console.error('   ERROR: Server configurations has not be initialized for module : ', moduleName);
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    console.log('   INFO: Configuring App from module : ', moduleName);
                    console.log('     INFO: Executing common configurations');
                    SYSTEM.executeRouterConfig(value.app, commonConfig);
                    let moduleConfig = SYSTEM.loadFiles(CONFIG.getProperties(), '/src/router/' + moduleName + 'AppConfig.js');
                    if (moduleConfig != null && moduleConfig) {
                        console.log('     INFO: Executing module configurations :', moduleName);
                        SYSTEM.executeRouterConfig(value.app, moduleConfig);
                    }
                }
            });
        }
    }
};