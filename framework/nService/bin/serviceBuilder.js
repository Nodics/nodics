const _ = require('lodash');

module.exports = {
    replacePlaceholders: function(serviceCommon, modelName, moduleName) {
        var serviceString = JSON.stringify(serviceCommon, function(key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else {
                return value;
            }
        });

        serviceString = serviceString.replaceAll('daoName', modelName + 'Dao')
            .replaceAll('mdulName', moduleName);
        return JSON.parse(serviceString, function(key, value) {
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
        let serviceCommon = SYSTEM.loadFiles(CONFIG, '/src/service/common.js');
        let db = DB[databaseName];
        let models = db.models || {};
        let rawSchema = db.rawschema || {};
        var service = global.SERVICE || {};
        _.each(rawSchema, function(value, key) {
            let modelName = key.toUpperCaseEachWord();
            if (value.model) {
                service[modelName + 'Service'] = _self.replacePlaceholders(serviceCommon, modelName, value.moduleName);
            }
        });
        return service;
    },

    walkThroughDatabases: function() {
        let _self = this;
        _.each(CONFIG.database, function(value, databaseName) {
            global.SERVICE = _self.walkThroughModels(databaseName);
        });
    },

    init: function() {
        this.walkThroughDatabases();
    }
}