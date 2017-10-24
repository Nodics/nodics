module.exports = {
    validateDatabaseConfiguration: function(dbName) {
        var flag = true;
        if (!dbName) {
            dbName = 'default';
        }
        if (!CONFIG.database) {
            console.error('   ERROR: Databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        if (!CONFIG.database[dbName]) {
            console.error('   ERROR: Default databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        return flag;
    },
    getDatabase: function(moduleName) {
        if (NODICS.dbs[moduleName]) {
            return NODICS.dbs[moduleName];
        } else {
            return NODICS.dbs['default'];
        }
    },
    getDatabaseConfiguration: function(moduleName) {
        if (CONFIG.database[moduleName]) {
            return CONFIG.database[moduleName];
        } else {
            return CONFIG.database.default;
        }
    },

    createModelName: function(modelName) {
        var name = modelName.toUpperCaseFirstChar() + 'Model';
        return name;
    },

    getModelName: function(modelName) {
        var name = modelName.toUpperCaseFirstChar().replace("Model", "");
        return name;
    },

    validateSchemaDefinition: function(modelName, schemaDefinition) {
        let flag = true;
        if (!schemaDefinition.super) {
            console.error('   ERROR: Invalid schema definition for : ' + modelName + ', please define super attribute');
            flag = false;
        } else if (!schemaDefinition.definition) {
            console.error('   ERROR: Invalid schema definition for : ' + modelName + ', please define definition attribute');
            flag = false;
        }
    }
}