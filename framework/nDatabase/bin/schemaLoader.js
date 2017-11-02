const _ = require('lodash');
const extend = require('mongoose-schema-extend');
const util = require('util');
module.exports = {
    deployValidators: function() {
        console.log(' =>Starting validators loading process');
        NODICS.setValidators(SYSTEM.loadFiles('/src/schemas/validators.js'));
    },

    createSchema: function(database, schema, moduleName, modelName, schemaDefinition) {
        if (schemaDefinition.super === 'none') {
            schema[modelName] = new database.getSchema()(schemaDefinition.definition);
        } else {
            let superSchema = schemaDefinition.super;
            if (!schema[superSchema]) {
                let rawSchema = JSON.parse(JSON.stringify(NODICS.getModule(moduleName).rawSchema));
                this.resolveSchemaDependancy(moduleName, superSchema, rawSchema[superSchema]);
            }
            schema[modelName] = schema[superSchema].extend(schemaDefinition.definition);
        }
    },

    resolveSchemaDependancy: function(moduleName, modelName, schemaDefinition) {
        let flag = false;
        let database = SYSTEM.getDatabase(moduleName);
        let masterSchema = NODICS.getModule(moduleName).schemas.master;
        let testSchema = NODICS.getModule(moduleName).schemas.test;

        if (SYSTEM.validateSchemaDefinition(modelName, schemaDefinition)) {
            process.exit(CONFIG.get('errorExitCode'));
        }
        if (masterSchema[modelName] && testSchema[modelName]) {
            return true;
        }
        if (!masterSchema[modelName]) {
            this.createSchema(database.master, masterSchema, moduleName, modelName, schemaDefinition);
            flag = true;
        }
        if (!testSchema[modelName]) {
            this.createSchema(database.test, testSchema, moduleName, modelName, schemaDefinition);
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
                if (!moduleObject.schemas) {
                    moduleObject.schemas = {};
                }
                if (!moduleObject.schemas.master) {
                    moduleObject.schemas.master = {};
                }
                if (!moduleObject.schemas.test) {
                    moduleObject.schemas.test = {};
                }
                _self.extractRawSchema(moduleName, moduleObject);
            }
        });
    },

    deploySchemas: function() {
        console.log(' =>Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles('/src/schemas/schemas.js');
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
        let interceptorFiles = SYSTEM.loadFiles('/src/schemas/interceptors.js');
        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
            if (moduleObject.rawSchema) {
                let masterSchema = moduleObject.schemas.master;
                let testSchema = moduleObject.schemas.test;
                _.each(moduleObject.rawSchema, function(value, key) {
                    if (value.model) {
                        let defaultFunctions = SYSTEM.getAllMethods(interceptorFiles.default);
                        defaultFunctions.forEach(function(operationName) {
                            interceptorFiles.default[operationName](masterSchema[key]);
                            interceptorFiles.default[operationName](testSchema[key]);
                        });
                        let moduleInterceptors = interceptorFiles[moduleName];
                        if (moduleInterceptors) {
                            let moduleFunctions = SYSTEM.getAllMethods(moduleInterceptors);
                            moduleFunctions.forEach(function(operationName) {
                                moduleInterceptors[operationName](masterSchema[key]);
                                moduleInterceptors[operationName](testSchema[key]);
                            });
                        }
                    }
                });
            }
        });
    },

    createModelsForDatabase: function(moduleName, moduleObject) {
        let masterDB = NODICS.getDatabase(moduleName).master;
        let testDB = NODICS.getDatabase(moduleName).test;
        let masterSchema = moduleObject.schemas.master;
        let testSchema = moduleObject.schemas.test;
        _.each(moduleObject.rawSchema, function(value, key) {
            if (value.model) {
                modelName = SYSTEM.createModelName(key);
                console.log('   INFO: Creating model instance for : ', modelName);
                moduleObject.models.master[modelName] = masterDB.getConnection().model(modelName, masterSchema[key]);
                moduleObject.models.test[modelName] = testDB.getConnection().model(modelName, testSchema[key]);
            }
        });
    },

    createModels: function() {
        let _self = this;
        console.log(' =>Starting model generation process');
        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
            if (moduleObject.rawSchema) {
                if (!moduleObject.models) {
                    moduleObject.models = {};
                }
                if (!moduleObject.models.master) {
                    moduleObject.models.master = {};
                }
                if (!moduleObject.models.test) {
                    moduleObject.models.test = {};
                }
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