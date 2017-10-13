const _ = require('lodash');

module.exports = {
    replacePlaceHolders: function(functionDefinition, daoName) {
        var routerString = JSON.stringify(functionDefinition, function(key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else {
                return value;
            }
        });

        let contextRoot = CONFIG.contextRoot;
        let modelName = daoName.toLowerCaseFirstChar();
        routerString = routerString.replaceAll("contextRoot", contextRoot);
        routerString = routerString.replaceAll("modelName", modelName);
        routerString = routerString.replaceAll("daoName", daoName + 'Dao');
        routerString = routerString.replaceAll("controllerName", daoName + 'Controller');
        //console.log(routerString);
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

    init: function() {
        let _self = this;
        console.log('### Starting Router registration process');
        let appRoter = SYSTEM.loadFiles(CONFIG, '/src/router/router.js');
        Object.keys(API).forEach(function(key) {
            let apiElement = API[key];
            if (apiElement.app) {
                _.each(DB, function(value, databaseName) {
                    _self.registerForDatabase(databaseName, apiElement.app, appRoter.default, appRoter[key]);
                });
            }
        });
    },
};