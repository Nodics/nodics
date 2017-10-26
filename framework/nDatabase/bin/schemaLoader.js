const _ = require('lodash');
const extend = require('mongoose-schema-extend');
const util = require('util');
module.exports = {
    deployValidators: function() {
        console.log(' =>Starting validators loading process');
        NODICS.setValidators(SYSTEM.loadFiles(CONFIG.getProperties(), '/src/schemas/validators.js'));
    },

    resolveSchemaDependancy: function(moduleName, modelName, schemaDefinition) {
        let flag = false;
        let db = SYSTEM.getDatabase(moduleName);
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject.schemas) {
            moduleObject.schemas = {};
        }
        if (SYSTEM.validateSchemaDefinition(modelName, schemaDefinition)) {
            process.exit(CONFIG.get('errorExitCode'));
        }
        if (moduleObject.schemas[modelName]) {
            return true;
        }
        if (schemaDefinition.super === 'none') {
            moduleObject.schemas[modelName] = new db.Schema(schemaDefinition.definition);
            flag = true;
        } else {
            let superSchema = schemaDefinition.super;
            if (!moduleObject.schemas[superSchema]) {
                let rawSchema = JSON.parse(JSON.stringify(moduleObject.rawSchema));
                this.resolveSchemaDependancy(moduleName, superSchema, rawSchema[superSchema]);
            }
            moduleObject.schemas[modelName] = moduleObject.schemas[superSchema].extend(schemaDefinition.definition);
            flag = true;
        }

        return flag;
    },
    traverseSchemas: function(moduleName, rawSchema) {
        let _self = this;
        let cloneSchema = JSON.parse(JSON.stringify(rawSchema));
        _.each(rawSchema, function(valueIn, keyIn) {
            if (_self.resolveSchemaDependancy(moduleName, keyIn, valueIn)) {
                delete cloneSchema[keyIn];
            }
        });
        return cloneSchema;
    },

    extractRawSchema: function(moduleName, moduleObject) {
        let _self = this;
        let db = SYSTEM.getDatabase(moduleName);
        let rawSchema = JSON.parse(JSON.stringify(moduleObject.rawSchema));
        let loop = true;
        let counter = 0;
        do {
            rawSchema = this.traverseSchemas(moduleName, rawSchema);
            if (_.isEmpty(rawSchema)) {
                loop = false;
            }
        } while (loop && counter++ < 10);
    },

    createSchemas: function() {
        let _self = this;
        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
            if (moduleObject.rawSchema) {
                _self.extractRawSchema(moduleName, moduleObject);
            }
        });
    },

    deploySchemas: function() {
        console.log(' =>Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles(CONFIG.getProperties(), '/src/schemas/schemas.js');
        let modules = NODICS.getModules();
        Object.keys(mergedSchema).forEach(function(key) {
            if (key !== 'default') {
                let moduleObject = modules[key];
                if (!moduleObject) {
                    console.error('   ERROR: Module name : ', key, ' is not valid. Please define a valide module name in schema');
                    process.exit(CONFIG.get('errorExitCode'));
                }
                moduleObject.rawSchema = _.merge(mergedSchema[key], mergedSchema.default);
            }
        });
        this.createSchemas();
    },

    deployInterceptors: function() {
        console.log(' =>Starting interceptors loading process');
        let interceptorFiles = SYSTEM.loadFiles(CONFIG.getProperties(), '/src/schemas/interceptors.js');
        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
            if (moduleObject.schemas && moduleObject.rawSchema) {
                let schemas = moduleObject.schemas;
                _.each(moduleObject.rawSchema, function(value, key) {
                    if (value.model) {
                        let defaultFunctions = SYSTEM.getAllMethods(interceptorFiles.default);
                        defaultFunctions.forEach(function(operationName) {
                            interceptorFiles.default[operationName](schemas[key]);
                        });
                        let moduleInterceptors = interceptorFiles[moduleName];
                        if (moduleInterceptors) {
                            let moduleFunctions = SYSTEM.getAllMethods(moduleInterceptors);
                            moduleFunctions.forEach(function(operationName) {
                                moduleInterceptors[operationName](schemas[key]);
                            });
                        }
                    }
                });
            }
        });
    },

    createModelsForDatabase: function(moduleName, moduleObject) {
        let db = SYSTEM.getDatabase(moduleName);
        let schemas = moduleObject.schemas || {};
        let rawSchema = moduleObject.rawSchema || {};
        var models = {};
        _.each(rawSchema, function(value, key) {
            modelName = SYSTEM.createModelName(key);
            if (value.model) {
                models[modelName] = db.connection.model(modelName, schemas[key]);
            }
        });
        moduleObject.models = models;
    },



    createModels: function() {
        let _self = this;
        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
            if (moduleObject.schemas) {
                _self.createModelsForDatabase(moduleName, moduleObject);
            }
        });
    },

    init: function() {
        this.deployValidators();
        this.deploySchemas();
        this.deployInterceptors();
        this.createModels();
    }
};