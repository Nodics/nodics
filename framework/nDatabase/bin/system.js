module.exports = {
    validateDatabaseConfiguration: function(dbName) {
        var flag = true;
        if (!dbName) {
            dbName = 'default';
        }
        if (!CONFIG.get('database')) {
            console.error('   ERROR: Databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        if (!CONFIG.get('database')[dbName]) {
            console.error('   ERROR: Default databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        return flag;
    },
    getDatabase: function(moduleName) {
        if (NODICS.getDatabase(moduleName)) {
            return NODICS.getDatabase(moduleName);
        } else {
            return NODICS.getDatabase('default');
        }
    },
    getDatabaseConfiguration: function(moduleName) {
        if (CONFIG.get('database')[moduleName]) {
            return CONFIG.get('database')[moduleName];
        } else {
            return CONFIG.get('database').default;
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