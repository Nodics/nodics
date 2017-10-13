const _ = require('lodash');
const extend = require('mongoose-schema-extend');

module.exports = {
    deployValidators: function() {
        console.log('###  Starting validators loading process');
        DB['validators'] = SYSTEM.loadFiles(CONFIG, '/src/schemas/validators.js');
    },

    resolveSchemaDependancy: function(databaseName, modelName, schemaDefinition) {
        let flag = false;
        let db = DB[databaseName];
        let schemas = db.schemas || {};
        if (SYSTEM.validateSchemaDefinition(modelName, schemaDefinition)) {
            process.exit(CONFIG.errorExitCode);
        }
        if (schemaDefinition.super === 'none') {
            schemas[modelName] = new db.Schema(schemaDefinition.definition);
            flag = true;
        } else {
            let superSchema = schemaDefinition.super;
            if (schemas[superSchema]) {
                schemas[modelName] = schemas[superSchema].extend(schemaDefinition.definition);
                flag = true;
            } else {
                console.error('## Couldnt find super schema definition ', superSchema, ' for ', modelName);
                process.exit(CONFIG.errorExitCode);
            }
        }
        db.schemas = schemas;
        return flag;
    },
    traverseSchemas: function(databaseName, rawschema) {
        let _self = this;
        var cloneSchema = JSON.parse(JSON.stringify(rawschema));
        _.each(rawschema, function(valueIn, keyIn) {
            if (_self.resolveSchemaDependancy(databaseName, keyIn, valueIn)) {
                delete cloneSchema[keyIn];
            }
        });
        return cloneSchema;
    },
    extractRawSchema: function(databaseName) {
        let _self = this;
        var db = DB[databaseName];
        var rawschema = JSON.parse(JSON.stringify(db.rawschema));
        let loop = true;
        let counter = 0;
        do {
            rawschema = this.traverseSchemas(databaseName, rawschema);
            if (_.isEmpty(rawschema)) {
                loop = false;
            }
        } while (loop && counter++ < 10);
    },

    createModelsForDatabase: function(databaseName) {
        if (!DB || !DB[databaseName] || !DB[databaseName].schemas) {
            console.error('## Couldnt find any schema definition to create models');
            process.exit(CONFIG.errorExitCode);
        }
        let db = DB[databaseName];
        let schemas = db.schemas || {};
        let rawSchema = db.rawschema || {};
        var models = {};
        _.each(rawSchema, function(value, key) {
            modelName = SYSTEM.createModelName(key);
            if (value.model) {
                models[modelName] = db.connection.model(modelName, schemas[key]);
            }
        });
        db['models'] = models;
    },

    createSchemas: function() {
        let _self = this;
        _.each(CONFIG.database, function(value, databaseName) {
            _self.extractRawSchema(databaseName);
        });
    },

    createModels: function() {
        let _self = this;
        _.each(CONFIG.database, function(value, databaseName) {
            _self.createModelsForDatabase(databaseName);
        });
    },
    deploySchemas: function() {
        console.log('###  Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles(CONFIG, '/src/schemas/schemas.js');
        let commonSchema = mergedSchema.default || {};
        Object.keys(mergedSchema).forEach(function(key) {
            if (key !== 'default') {
                var db = SYSTEM.getDatabase(key); // this return global instance of DB
                var schemas = db['rawschema'] || commonSchema;
                let moduleSchema = mergedSchema[key];
                _.each(moduleSchema, function(value, name) {
                    moduleSchema[name].moduleName = key;
                });
                db.rawschema = _.merge(schemas, moduleSchema);
            }
        });
        this.createSchemas();
    },

    deployInterceptors: function() {
        console.log('###  Starting interceptors loading process');
        let interceptorFiles = SYSTEM.loadFiles(CONFIG, '/src/schemas/interceptors.js');
        _.each(CONFIG.database, function(value, databaseName) {
            let db = DB[databaseName];
            let schemas = db.schemas || {};
            let rawSchema = db.rawschema || {};
            if (interceptorFiles.default) {
                _.each(rawSchema, function(value, key) {
                    if (value.model) {
                        Object.keys(interceptorFiles.default).forEach(function(operationName) {
                            interceptorFiles.default[operationName](schemas[key]);
                        });
                    }
                });
            }
        });
        Object.keys(interceptorFiles).forEach(function(groupName) {
            if (groupName !== 'default') {
                let operations = interceptorFiles[groupName];
                let db = SYSTEM.getDatabase(groupName);
                let schemas = db.schemas || {};
                let rawSchema = db.rawschema || {};
                _.each(rawSchema, function(value, key) {
                    if (value.model) {
                        Object.keys(operations).forEach(function(name) {
                            operations[name](schemas[key]);
                        });
                    }
                });
            }
        });
    },

    init: function() {
        this.deployValidators();
        this.deploySchemas();
        this.deployInterceptors();
        this.createModels();
    }
}