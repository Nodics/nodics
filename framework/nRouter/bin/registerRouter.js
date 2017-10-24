const _ = require('lodash');

module.exports = {
    /*
        replacePlaceHolders: function(options) {
        
                //options.commonDefinition, options.schemaName
                var routerString = JSON.stringify(options.commonDefinition, function(key, value) {
                    if (typeof value === 'function') {
                        return value.toString();
                    } else {
                        return value;
                    }
                });
                if (!CONFIG.server.contextRoot) {
                    console.error('Please define a valid contextRoot, It comes under server object.');
                    process.exit(1);
                }

                let contextRoot = CONFIG.server.contextRoot;

                routerString = routerString.replaceAll("contextRoot", contextRoot);
                routerString = routerString.replaceAll("modelName", options.modelName);
                routerString = routerString.replaceAll("controllerName", options.modelName + 'Controller');
                return JSON.parse(routerString, function(key, value) {
                    if (_(value).startsWith('function')) {
                        value = value.replace("function", key + ' = function');
                        return eval(value);
                    } else {
                        return value;
                    }
                });
            },
            
                executeRouterFunction: function(router, app, modelName) {
                    //router - list of functions
                    //apiElement[metadata, daoapp and apiapp] - express object for module
                    //modelName - Current model name
                    let _self = this;
                    var model = SYSTEM.getModelName(modelName);
                    let routerObject = _self.replacePlaceHolders(router, model);
                    Object.keys(routerObject).forEach(function(key) {
                        let instance = routerObject[key];
                        if (instance && typeof instance === "function") {
                            instance(app);
                        }
                    });
                },

                registerForDatabase: function(databaseName, app, commonRouter, moduleRoter) {
                    let _self = this;
                    let db = SYSTEM.getDatabase(databaseName); // get database object for current
                    let models = db.models || {};
                    _.each(models, function(value, key) {
                        if (commonRouter) {
                            _self.executeRouterFunction(commonRouter, app, key);
                        }
                        if (moduleRoter) {
                            _self.executeRouterFunction(moduleRoter, app, key);
                        }
                    });
                },

                init1: function() {
                    let _self = this;
                    console.log('### Starting Router registration process');
                    let commonRoter = SYSTEM.loadFiles(CONFIG, '/src/router/commonRouter.js');
                    Object.keys(API).forEach(function(key) {
                        let apiElement = API[key];
                        let moduleRoter = null;
                        if (apiElement.app) {
                            let moduleName = apiElement.metaData.name.toLowerCase();
                            moduleRoter = SYSTEM.loadFiles(CONFIG, '/src/router/' + moduleName + 'Router.js');
                            _.each(DB, function(value, databaseName) {
                                if (databaseName !== 'validators') {
                                    _self.registerForDatabase(databaseName, apiElement.app, commonRoter, moduleRoter);
                                }
                            });
                        }
                    });
                },
    */

    registerModelRouter: function(options) {
        console.log('       INFO: Registering router for model : ', options.schemaName);
        options.modelName = options.schemaName.toUpperCaseEachWord();
        let routerObject = SYSTEM.replacePlaceholders(options);
        Object.keys(routerObject).forEach(function(key) {
            if (routerObject[key] && typeof routerObject[key] === "function") {
                routerObject[key](options.app);
            }
        });
    },


    init: function() {
        let _self = this;
        console.log(' =>Starting routers registration process');
        let modules = NODICS.modules;
        let commonRoter = SYSTEM.loadFiles(CONFIG, '/src/router/commonRouter.js');
        if (CONFIG.server.runAsSingleModule) {
            if (!NODICS.modules.default || !NODICS.modules.default.app) {
                console.error('   ERROR: Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.errorExitCode);
            }
            console.log('   INFO: Registering routers with Default App');
            console.log('     INFO: Executing common routers');
            SYSTEM.modelsWalkThrough({
                requireParsing: true,
                commonDefinition: commonRoter,
                app: NODICS.modules.default.app
            }, this.registerModelRouter);
            _.each(modules, function(value, moduleName) {
                let moduleRouter = SYSTEM.loadFiles(CONFIG, '/src/router/' + moduleName + 'Router.js');
                if (!SYSTEM.isBlank(moduleRouter)) {
                    console.log('     INFO: Executing module configurations :', moduleName);
                    Object.keys(moduleRouter).forEach(function(key) {
                        if (moduleRouter[key] && typeof moduleRouter[key] === "function") {
                            moduleRouter[key](NODICS.modules.default.app);
                        }
                    });
                }
            });
        } else {
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (!value.app) {
                        console.error('   ERROR: Server configurations has not be initialized for module : ', moduleName);
                        process.exit(CONFIG.errorExitCode);
                    }
                    console.log('   INFO: Registering routers for module : ', moduleName);
                    console.log('     INFO: Executing common routers');
                    SYSTEM.modelsWalkThrough({
                        requireParsing: true,
                        commonDefinition: commonRoter,
                        app: value.app,
                        moduleName: moduleName
                    }, _self.registerModelRouter);
                    let moduleRouter = SYSTEM.loadFiles(CONFIG, '/src/router/' + moduleName + 'Router.js');
                    if (!SYSTEM.isBlank(moduleRouter)) {
                        console.log('     INFO: Executing module configurations :', moduleName);
                        Object.keys(moduleRouter).forEach(function(key) {
                            if (moduleRouter[key] && typeof moduleRouter[key] === "function") {
                                moduleRouter[key](value.app);
                            }
                        });
                    }
                }
            });
        }
    }
};