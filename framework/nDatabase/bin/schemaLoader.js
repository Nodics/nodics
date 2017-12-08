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
    deployValidators: function() {
        console.log(' =>Starting validators loading process');
        NODICS.setValidators(SYSTEM.loadFiles('/src/schemas/validators.js'));
    },

    interceptorMiddleware: function(interceptors, moduleSchema) {
        if (!UTILS.isBlank(interceptors)) {
            let interceptorFunctions = SYSTEM.getAllMethods(interceptors);
            interceptorFunctions.forEach(function(operationName) {
                interceptors[operationName](moduleSchema);
            });
        }
    },

    modelDaoMiddleware: function(dao, moduleSchema, schemaDef) {
        if (!UTILS.isBlank(dao)) {
            let daoFunctions = SYSTEM.getAllMethods(dao);
            daoFunctions.forEach(function(operationName) {
                dao[operationName](moduleSchema, schemaDef);
                dao[operationName](moduleSchema, schemaDef);
            });
        }
    },

    registerSchemaMiddleWare: function(options) {
        this.interceptorMiddleware(options.interceptors.default, options.modelSchema);
        if (options.interceptors[options.moduleName]) {
            this.interceptorMiddleware(options.interceptors[options.moduleName].default, options.modelSchema);
            this.interceptorMiddleware(options.interceptors[options.moduleName][options.modelName], options.modelSchema);
        }

        this.modelDaoMiddleware(options.daos.default, options.modelSchema, options.schemaDef);
        if (options.daos[options.moduleName]) {
            this.modelDaoMiddleware(options.daos[options.moduleName].default, options.modelSchema, options.schemaDef);
            this.modelDaoMiddleware(options.daos[options.moduleName][options.modelName], options.modelSchema, options.schemaDef);
        }
    },

    createModelObject: function(options) {
        let modelName = SYSTEM.createModelName(options.modelName);
        //console.log(' ----- creating model : ', modelName);
        options.modelObject[modelName] = options.database.getConnection().model(modelName, options.modelSchema);
    },

    createSchema: function(options) {
        if (options.schemaDef.super === 'none') {
            options.schemaObject[options.modelName] = new options.database.getSchema()(options.schemaDef.definition);
        } else {
            let superSchema = options.schemaDef.super;
            if (!options.schemaObject[superSchema]) {
                let rawSchema = NODICS.getModule(options.moduleName).rawSchema;
                let tmpOptions = _.merge({}, options);
                tmpOptions.schemaDef = rawSchema[superSchema];
                tmpOptions.modelName = superSchema;
                this.resolveSchemaDependancy(tmpOptions);
            }
            options.schemaObject[options.modelName] = options.schemaObject[superSchema].extend(options.schemaDef.definition);
        }
        if (options.schemaDef.model) {
            options.modelSchema = options.schemaObject[options.modelName];
            this.registerSchemaMiddleWare(options);
            this.createModelObject(options);
        }
    },

    resolveSchemaDependancy: function(options) {
        let _self = this;
        let flag = false;
        CONFIG.get('installedTanents').forEach(function(tntName) {
            flag = false;
            if (SYSTEM.validateSchemaDefinition(options.modelName, options.schemaDef)) {
                process.exit(CONFIG.get('errorExitCode'));
            }
            let database = NODICS.getDatabase(options.moduleName, tntName);
            let schemaObject = NODICS.getModule(options.moduleName).schemas;
            let modelObject = NODICS.getModule(options.moduleName).models;
            if (!schemaObject[tntName]) {
                schemaObject[tntName] = {
                    master: {},
                    test: {}
                };
            }

            if (!modelObject[tntName]) {
                modelObject[tntName] = {
                    master: {},
                    test: {}
                };
            }

            if (schemaObject[tntName].master[options.modelName] && schemaObject[tntName].test[options.modelName]) {
                return true;
            }
            if (!schemaObject[tntName].master[options.modelName]) {
                options.database = database.master;
                options.schemaObject = schemaObject[tntName].master;
                options.modelObject = modelObject[tntName].master;
                _self.createSchema(options);
                flag = true;
            }
            if (!schemaObject[tntName].test[options.modelName]) {
                options.database = database.test;
                options.schemaObject = schemaObject[tntName].test;
                options.modelObject = modelObject[tntName].test;
                _self.createSchema(options);
                flag = true;
            }
        });
        return flag;
    },

    traverseSchemas: function(options) {
        let _self = this;
        let cloneSchema = _.merge({}, options.rawSchema);
        _.each(options.rawSchema, function(valueIn, keyIn) {
            options.modelName = keyIn;
            options.schemaDef = valueIn;
            if (_self.resolveSchemaDependancy(options)) {
                delete cloneSchema[keyIn];
            }
        });
        return cloneSchema;
    },

    extractRawSchema: function(options) {
        let _self = this;
        options.rawSchema = _.merge({}, options.moduleObject.rawSchema);
        let loop = true;
        let counter = 0;
        do {
            options.rawSchema = this.traverseSchemas(options);
            if (_.isEmpty(options.rawSchema)) {
                loop = false;
            }
        } while (loop && counter++ < 10);
    },

    createSchemas: function(options) {
        let _self = this;
        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
            if (moduleObject.rawSchema) {
                if (!moduleObject.schemas) {
                    moduleObject.schemas = {};
                }
                if (!moduleObject.models) {
                    moduleObject.models = {};
                }
                options.moduleName = moduleName;
                options.moduleObject = moduleObject;
                _self.extractRawSchema(options);
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
        this.createSchemas(options);
    },

    init: function() {
        this.deployValidators();
        this.deploySchemas();
    }
};