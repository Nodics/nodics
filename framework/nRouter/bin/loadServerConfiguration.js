module.exports = {
    init: function() {
        console.log('### Starting Server configuration load process.');
        if (!API) {
            console.log('### Failed to start server configuration load process.');
            process.exit(CONFIG.errorExitCode);
        }
        //Loading APP common config
        let commonConfig = SYSTEM.loadFiles(CONFIG, '/src/router/commonAppConfig.js');
        Object.keys(API).forEach(function(key) {
            let apiElement = API[key];
            let moduleConfig = null;
            if (apiElement.app) {
                SYSTEM.executeRouterConfig(apiElement.app, commonConfig);
                let moduleName = apiElement.metaData.name.toLowerCase();
                moduleConfig = SYSTEM.loadFiles(CONFIG, '/src/router/' + moduleName + 'AppConfig.js');
                if (moduleConfig != null && moduleConfig) {
                    SYSTEM.executeRouterConfig(apiElement.app, moduleConfig);
                }
            }
        });
    }
};