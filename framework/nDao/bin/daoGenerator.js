const _ = require('lodash');

module.exports = {
    replacePlaceholders: function(daoCommon, modelName) {
        var daoString = JSON.stringify(daoCommon, function(key, value) {
            if (typeof value === 'function') {
                return value.toString();
            } else {
                return value;
            }
        });

        daoString = daoString.replaceAll('databaseName', modelName)
            .replaceAll('modelName', modelName + 'Model')
            .replaceAll('modelVar', modelName);
        return JSON.parse(daoString, function(key, value) {
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
            console.error('## Couldnt find any model definition to create DAOs');
            process.exit(CONFIG.errorExitCode);
        }
        let daoCommon = SYSTEM.loadFiles(CONFIG, '/src/dao/common.js');
        let db = DB[databaseName];
        let models = db.models || {};
        let rawSchema = db.rawschema || {};
        var daos = global.DAO || {};
        _.each(rawSchema, function(value, key) {
            let modelName = key.toUpperCaseEachWord();
            if (value.model) {
                daos[modelName + 'Dao'] = _self.replacePlaceholders(daoCommon, modelName);
            }
        });
        return daos;
    },

    walkThroughDatabases: function() {
        let _self = this;
        _.each(CONFIG.database, function(value, databaseName) {
            global.DAO = _self.walkThroughModels(databaseName);
        });
    },

    init: function() {
        this.walkThroughDatabases();
    }
}