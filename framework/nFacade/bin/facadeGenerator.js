const _ = require('lodash');

module.exports = {
    replacePlaceholders: function(facadeCommon, modelName) {
        var facadeString = JSON.stringify(facadeCommon, function(key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else {
                return value;
            }
        });

        facadeString = facadeString.replaceAll('ServiceName', modelName + 'Service');
        //console.log(facadeString);       
        return JSON.parse(facadeString, function(key, value) {
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
        let facadeCommon = SYSTEM.loadFiles(CONFIG, '/src/facade/common.js');
        let db = DB[databaseName];
        let models = db.models || {};
        let rawSchema = db.rawschema || {};
        var facade = global.FACADE || {};
        _.each(rawSchema, function(value, key) {
            let modelName = key.toUpperCaseEachWord();
            if (value.model) {
                facade[modelName + 'Facade'] = _self.replacePlaceholders(facadeCommon, modelName);
            }
        });
        return facade;
    },

    walkThroughDatabases: function() {
        let _self = this;
        _.each(CONFIG.database, function(value, databaseName) {
            global.FACADE = _self.walkThroughModels(databaseName);
        });
    },

    init: function() {
        this.walkThroughDatabases();
    }
}