const _ = require('lodash');

module.exports = {
    replacePlaceholders: function(cntrollerCommon, modelName, moduleName) {
        var controllerString = JSON.stringify(cntrollerCommon, function(key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else {
                return value;
            }
        });

        controllerString = controllerString.replaceAll('FacadeName', modelName + 'Facade')
            .replaceAll('modelName', modelName.toLowerCaseFirstChar())
            .replaceAll('mdulName', moduleName);
        return JSON.parse(controllerString, function(key, value) {
            if (_(value).startsWith('function')) {
                value = value.replace("function", key + ' = function');
                return eval(value);
            } else {
                return value;
            }
        });
    },

    walkThroughModels: function(databaseName) {
        let _self = this;
        if (!DB || !DB[databaseName] || !DB[databaseName].models) {
            console.error('## Couldnt find any model definition to create Services');
            process.exit(CONFIG.errorExitCode);
        }
        let cntrollerCommon = SYSTEM.loadFiles(CONFIG, '/src/controller/common.js');
        let db = DB[databaseName];
        let models = db.models || {};
        let rawSchema = db.rawschema || {};
        var controller = global.CONTROLLER || {};
        _.each(rawSchema, function(value, key) {
            let modelName = key.toUpperCaseEachWord();
            if (value.model) {
                controller[modelName + 'Controller'] = _self.replacePlaceholders(cntrollerCommon, modelName, value.moduleName);
            }
        });
        return controller;
    },

    walkThroughDatabases: function() {
        let _self = this;
        _.each(CONFIG.database, function(value, databaseName) {
            global.CONTROLLER = _self.walkThroughModels(databaseName);
        });
    },

    init: function() {
        this.walkThroughDatabases();
    }
}