/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const extend = require('mongoose-schema-extend');
const util = require('util');

module.exports = {

    getInterceptors: function() {
        let interceptorFiles = {};
        if (UTILS.isBlank(interceptorFiles)) {
            interceptorFiles = SYSTEM.loadFiles('/src/schemas/interceptors.js');
        }
        return interceptorFiles;
    },
    getDAOs: function() {
        let daoFiles = {};
        if (UTILS.isBlank(interceptorFiles)) {
            daoFiles = SYSTEM.loadFiles('/src/schemas/model.js');
        }
        return daoFiles;
    },

    deployValidators: function() {
        console.log(' =>Starting validators loading process');
        NODICS.setValidators(SYSTEM.loadFiles('/src/schemas/validators.js'));
    },

    executeInterceptor: function(interceptors, schemaName, moduleSchema) {
        if (!UTILS.isBlank(interceptors)) {
            let interceptorFunctions = SYSTEM.getAllMethods(interceptors);
            interceptorFunctions.forEach(function(operationName) {
                interceptors[operationName](moduleSchema[schemaName]);
                //interceptors[operationName](moduleSchema.test[schemaName]);
            });
        }
    },

    registerModel: function(dao, schemaName, moduleSchema, schemaDef) {
        if (!UTILS.isBlank(dao)) {
            let daoFunctions = SYSTEM.getAllMethods(dao);
            daoFunctions.forEach(function(operationName) {
                dao[operationName](moduleSchema.master[schemaName], schemaDef);
                dao[operationName](moduleSchema.test[schemaName], schemaDef);
            });
        }
    },


    deployInterceptors: function(moduleName, schemaName, moduleSchema, schemaDefinition) {
        this.executeInterceptor(this.getInterceptors().default, schemaName, moduleSchema);
        this.registerModel(this.getDAOs().default, schemaName, moduleSchema, schemaDefinition);
        if (this.getInterceptors()[moduleName]) {
            this.executeInterceptor(this.getInterceptors()[moduleName].default, schemaName, moduleSchema);
            this.executeInterceptor(this.getInterceptors()[moduleName][schemaName], schemaName, moduleSchema);
        }
        if (this.getDAOs()[moduleName]) {
            this.registerModel(this.getDAOs()[moduleName].default, schemaName, moduleSchema, schemaDefinition);
            this.registerModel(this.getDAOs()[moduleName][schemaName], schemaName, moduleSchema, schemaDefinition);
        }
    },

    createSchema: function(database, schema, moduleName, modelName, schemaDefinition) {
        if (schemaDefinition.super === 'none') {
            schema[modelName] = new database.getSchema()(schemaDefinition.definition);
        } else {
            let superSchema = schemaDefinition.super;
            if (!schema[superSchema]) {
                let rawSchema = NODICS.getModule(moduleName).rawSchema;
                this.resolveSchemaDependancy(moduleName, superSchema, rawSchema[superSchema]);
            }
            schema[modelName] = schema[superSchema].extend(schemaDefinition.definition);
        }
        if (schemaDefinition.model) {
            this.deployInterceptors(moduleName, modelName, schema[modelName], schemaDefinition);
        }
    },

    resolveSchemaDependancy: function(moduleName, modelName, schemaDefinition) {
        let _self = this;
        let flag = false;
        CONFIG.get('installedTanents').forEach(function(tntName) {
            flag = false;
            if (SYSTEM.validateSchemaDefinition(modelName, schemaDefinition)) {
                process.exit(CONFIG.get('errorExitCode'));
            }
            let database = NODICS.getDatabase(moduleName, tntName);
            let schemaObject = NODICS.getModule(moduleName).schemas;
            if (!schemaObject[tntName]) {
                schemaObject[tntName] = {
                    master: {},
                    test: {}
                };
            }
            if (schemaObject[tntName].master[modelName] && schemaObject[tntName].test[modelName]) {
                return true;
            }
            if (!schemaObject[tntName].master[modelName]) {
                _self.createSchema(database.master, schemaObject[tntName].master, moduleName, modelName, schemaDefinition);
                flag = true;
            }
            if (!schemaObject[tntName].test[modelName]) {
                _self.createSchema(database.test, schemaObject[tntName].test, moduleName, modelName, schemaDefinition);
                flag = true;
            }
        });
        return flag;
    },

    traverseSchemas: function(moduleName, rawSchema) {
        let _self = this;
        let cloneSchema = _.merge({}, rawSchema);
        _.each(rawSchema, function(valueIn, keyIn) {
            if (_self.resolveSchemaDependancy(moduleName, keyIn, valueIn)) {
                delete cloneSchema[keyIn];
            }
        });
        return cloneSchema;
    },

    extractRawSchema: function(moduleName, moduleObject) {
        let _self = this;
        let rawSchema = _.merge({}, moduleObject.rawSchema);
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
                _self.extractRawSchema(moduleName, moduleObject);
            }
        });
    },

    deploySchemas: function() {
        console.log(' =>Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles('/src/schemas/schemas.js');
        let options = {
            interceptors: SYSTEM.loadFiles('/src/schemas/interceptors.js'),
            daos: SYSTEM.loadFiles('/src/schemas/model.js'),
            schemas: mergedSchema
        };
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



    createModelsForDatabase: function(moduleName, moduleObject) {
        let masterDB = NODICS.getDatabase(moduleName).master;
        let testDB = NODICS.getDatabase(moduleName).test;
        let schemaObject = NODICS.getModule(moduleName).schemas;
        _.each(moduleObject.rawSchema, function(value, key) {
            if (value.model) {
                modelName = SYSTEM.createModelName(key);
                console.log('   INFO: Creating model instance for : ', modelName);
                CONFIG.get('installedTanents').forEach(function(tntName) {
                    let masterSchema = schemaObject[tntName].master;
                    let testSchema = schemaObject[tntName].test;
                    let database = NODICS.getDatabase(moduleName, tntName);
                    if (!moduleObject.models[tntName]) {
                        moduleObject.models[tntName] = {
                            master: {},
                            test: {}
                        };
                    }
                    moduleObject.models[tntName].master[modelName] = database.master.getConnection().model(modelName, masterSchema[key]);
                    moduleObject.models[tntName].test[modelName] = database.test.getConnection().model(modelName, testSchema[key]);
                });
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
                _self.createModelsForDatabase(moduleName, moduleObject);
            }
        });
    },

    init: function() {
        this.deployValidators();
        this.deploySchemas();
        //this.deployInterceptors();
        this.createModels();
    }
};