module.exports = {
    init: function() {
        console.log('### Starting Server configuration load process.');
        if (!API) {
            console.log('### Failed to start dao server configuration load process.');
            process.exit(CONFIG.errorExitCode);
        }
        //Loading APP common config
        let appConfig = SYSTEM.loadFiles(CONFIG, '/src/router/appConfig.js');
        //Loop through all defined API and execute default and dao specific configuration loader
        Object.keys(API).forEach(function(key) {
            let apiElement = API[key];
            if (apiElement.app) {
                if (appConfig.default) {
                    SYSTEM.executeRouterConfig(apiElement.app, appConfig.default);
                }
                if (appConfig[key]) {
                    SYSTEM.executeRouterConfig(apiElement.app, appConfig[key]);
                }
            }
        });
    }
}