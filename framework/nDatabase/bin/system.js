/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;


module.exports = {

    validateDatabaseConfiguration: function (dbName) {
        var flag = true;
        if (!dbName) {
            dbName = 'default';
        }
        if (!CONFIG.get('database')) {
            this.LOG.error('Databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        if (!CONFIG.get('database')[dbName]) {
            this.LOG.error('Default databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        return flag;
    },

    prepareInterceptors: function () {
        SYSTEM.LOG.debug('Starting interceptors loading process');
        NODICS.setInterceptors(SYSTEM.loadFiles('/src/schemas/interceptors.js'));
    },
    prepareDatabaseList: function () {
        let modules = NODICS.getModules();
        let dbModules = ['default'];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('database')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    createConnection: function (dbType, dbConfig, tntCode, type) {
        if (dbType === 'mysql') {

        } else {
            return this.createMongoDBConnection(dbConfig, tntCode, type);
        }
    },

    createMongoDBConnection: function (dbConfig, tntCode, type) {
        return new Promise((resolve, reject) => {
            SYSTEM.LOG.debug('Creating ', type, ' database connection for tenant: ', tntCode, ' URI: ', dbConfig.URI, ' DB Name: ', dbConfig.databaseName);
            let mongoClient = new MongoClient(dbConfig.URI, dbConfig.options || {});
            mongoClient.connect().then(client => {
                SYSTEM.LOG.info('MongoDB default connection open to ' + dbConfig.URI, ' for database: ', dbConfig.databaseName);
                let db = client.db(dbConfig.databaseName);
                db.listCollections({}, {
                    nameOnly: true
                }).toArray((error, collections) => {
                    if (error) {
                        SYSTEM.LOG.error('While fetching list of collections: ' + error);
                        reject('While fetching list of collections: ' + error);
                    } else {
                        resolve({
                            connection: db,
                            collections: collections
                        });
                    }
                });
            }).catch(error => {
                SYSTEM.LOG.error('MongoDB default connection error: ' + error);
                reject('MongoDB default connection error: ' + error);
            });
        });
    },

    createDatabase: function (moduleName, tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let dbConfig = NODICS.getDatabaseConfiguration(moduleName, tntCode);
            let dbType = dbConfig.databaseType;
            if (dbType !== 'mongodb') {
                SYSTEM.LOG.error('Found invalid database type: ', dbType, ' for module: ', moduleName);
                process.exit(1);
            }
            let testConfig = CONFIG.get('test');
            let masterDatabase = new CLASSES.Database();
            let testDatabase = null;

            masterDatabase.setName(moduleName);
            masterDatabase.setURI(dbConfig[dbType].master.URI);
            masterDatabase.setOptions(dbConfig[dbType].master.options);
            _self.createConnection(dbType, dbConfig[dbType].master, tntCode, 'master').then(result => {
                masterDatabase.setConnection(result.connection);
                masterDatabase.setCollections(result.collections);
                if (testConfig.enabled && testConfig.uTest.enabled) {
                    testDatabase = new CLASSES.Database();
                    if (dbConfig[dbType].test) {
                        testDatabase.setName(moduleName);
                        testDatabase.setURI(dbConfig[dbType].test.URI);
                        testDatabase.setOptions(dbConfig[dbType].test.options);
                        _self.createConnection(dbType, dbConfig[dbType].test, tntCode, 'test').then(response => {
                            testDatabase.setConnection(response.connection);
                            testDatabase.setCollections(result.collections);
                            NODICS.addTenantDatabase(moduleName, tntCode, {
                                master: masterDatabase,
                                test: testDatabase
                            });
                            resolve();
                        }).catch(error => {
                            reject('Could not connect test database : ' + error);
                        });
                    } else {
                        let testDB = NODICS.getDatabase('default', tntCode).test;
                        if (!testDB) {
                            SYSTEM.LOG.error('Default test database configuration not found. Please velidate database configuration');
                            process.exit(CONFIG.get('errorExitCode'));
                        } {

                        }
                        NODICS.addTenantDatabase(moduleName, tntCode, {
                            master: masterDatabase,
                            test: testDB
                        });
                        resolve();
                    }
                } else {
                    NODICS.addTenantDatabase(moduleName, tntCode, {
                        master: masterDatabase,
                        test: testDatabase
                    });
                    resolve();
                }
            }).catch(error => {
                reject('Could not connect master database : ' + error);
            });
        });
    },

    createTenantDatabase: function (tntCode) {
        return new Promise((resolve, reject) => {
            let dbModules = SYSTEM.prepareDatabaseList();
            dbModules.splice(dbModules.indexOf('default'), 1);
            SYSTEM.createDatabase('default', tntCode).then(success => {
                let allModules = [];
                dbModules.forEach(moduleName => {
                    allModules.push(SYSTEM.createDatabase(moduleName, tntCode));
                });
                if (allModules.length > 0) {
                    Promise.all(allModules).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            }).catch(error => {
                reject('Could not found any database configuration, Please configure at least default one');
            });
        });
    },

    modelMiddleware: function (modelGroup, collection, schemaDef) {
        if (!UTILS.isBlank(modelGroup)) {
            let modelFunctions = SYSTEM.getAllMethods(modelGroup);
            modelFunctions.forEach(function (operationName) {
                modelGroup[operationName](collection, schemaDef);
            });
        }
    },

    registerModelMiddleWare: function (options, collection, rawSchema) {
        let rawModels = NODICS.getRawModels();
        SYSTEM.modelMiddleware(rawModels.default, collection, rawSchema);
        if (rawModels[options.moduleName]) {
            SYSTEM.modelMiddleware(rawModels[options.moduleName].default, collection, rawSchema);
            SYSTEM.modelMiddleware(rawModels[options.moduleName][options.schemaName], collection, rawSchema);
        }
    },

    prepareCassandraDBOptions: function (options) {

    },

    prepareMongoDBOptions: function (options) {
        let schema = options.moduleObject.rawSchema[options.schemaName];
        let indexedFields = {};
        let defaultValues = {};
        let jsonSchema = {
            bsonType: 'object',
            required: [],
            properties: {}
        };
        if (schema.definition) {
            Object.keys(schema.definition).forEach(propertyName => {
                let property = _.merge({}, schema.definition[propertyName]);
                jsonSchema.properties[propertyName] = {};
                if (property.type) {
                    jsonSchema.properties[propertyName].bsonType = property.type;
                    delete property.type;
                }
                if (property.required && property.required === true) {
                    jsonSchema.required.push(propertyName);
                    delete property.required;
                }
                if (typeof property.default !== 'undefined') {
                    defaultValues[propertyName] = property.default;
                    delete property.default;
                }
                if (UTILS.isBlank(property)) {
                    _.merge(jsonSchema.properties[propertyName], property);
                }
                if (!property.description) {
                    jsonSchema.properties[propertyName].description = 'must be a ' + jsonSchema.properties[propertyName].bsonType;
                    if (jsonSchema.required.includes(propertyName)) {
                        jsonSchema.properties[propertyName].description += ' and is required';
                    } else {
                        jsonSchema.properties[propertyName].description += ' and is not required';
                    }
                }

            });
        }
        if (schema.indexes) {
            Object.keys(schema.indexes).forEach(propertyName => {
                let indexConfig = schema.indexes[propertyName];
                indexedFields[indexConfig.name] = {};
                indexedFields[indexConfig.name].field = {};
                indexedFields[indexConfig.name].field[indexConfig.name] = 1;
                indexedFields[indexConfig.name].options = indexConfig.options;
            });
        }
        if (!schema.schemaOptions) {
            schema.schemaOptions = {};
        }
        schema.schemaOptions[options.tntCode] = {};
        schema.schemaOptions[options.tntCode] = {
            options: {
                validator: {
                    '$jsonSchema': jsonSchema
                }
            },
            indexedFields: indexedFields,
            defaultValues: defaultValues
        };
    },

    prepareDatabaseOptions: function (options) {
        if (options.dbType === 'mongodb') {
            return SYSTEM.prepareMongoDBOptions(options);
        } else {
            return SYSTEM.prepareCassandraDBOptions(options);
        }
    },

    createIndex: function (model, indexConfig) {
        return new Promise((resolve, reject) => {
            model.dataBase.getConnection().createIndex(model.modelName, indexConfig.field, indexConfig.options).then(success => {
                resolve('Index updated for ' + Object.keys(indexConfig.field)[0]);
            }).catch(error => {
                reject('Index failed for ' + Object.keys(indexConfig.field)[0] + ' : ' + error.toString());
            });
        });
    },

    createIndexes: function (model) {
        return new Promise((resolve, reject) => {
            if (model) {
                let schemaOptions = model.rawSchema.schemaOptions[model.tenant];
                let allPromise = [];
                if (!UTILS.isBlank(schemaOptions.indexedFields)) {
                    _.each(schemaOptions.indexedFields, (config, field) => {
                        allPromise.push(SYSTEM.createIndex(model, config));
                    });
                    if (allPromise.length > 0) {
                        Promise.all(allPromise).then(success => {
                            let response = {};
                            response[model.schemaName + '_' + model.tenant + '_' + model.channel] = success;
                            resolve(response);
                        }).catch(error => {
                            let response = {};
                            response[model.schemaName + '_' + model.tenant + '_' + model.channel] = error;
                            reject(response);
                        });
                    } else {
                        let response = {};
                        response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'There are none properties having index value';
                        resolve(response);
                    }
                } else {
                    let response = {};
                    response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'There are none properties having index value';
                    resolve(response);
                }
            } else {
                let response = {};
                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Invalid schema value to update indexes';
                reject(response);
            }
        });
    },

    updateValidator: function (model) {
        return new Promise((resolve, reject) => {
            if (model) {
                let schema = model.rawSchema;
                let schemaOptions = model.rawSchema.schemaOptions[model.tenant];
                let tmpOptions = { collMod: model.modelName };
                tmpOptions = _.merge(tmpOptions, schema.options || {});
                if (schemaOptions.options && !UTILS.isBlank(schemaOptions.options)) {
                    tmpOptions = _.merge(tmpOptions, schemaOptions.options);
                }
                model.dataBase.getConnection().command(tmpOptions).then(success => {
                    let response = {};
                    response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Validator updated';
                    resolve(response);
                }).catch(error => {
                    let response = {};
                    response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Validator update failed';
                    reject(response);
                });
            } else {
                let response = {};
                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Invalid schema value to update validator';
                reject(response);
            }
        });
    },

    createModel: function (options, dataBase) {
        return new Promise((resolve, reject) => {
            let schema = options.moduleObject.rawSchema[options.schemaName];
            let schemaOptions = schema.schemaOptions[options.tntCode];
            let tmpOptions = schema.options || {};
            if (schemaOptions.options && !UTILS.isBlank(schemaOptions.options)) {
                tmpOptions = _.merge(tmpOptions, schemaOptions.options);
            }
            dataBase.getConnection().createCollection(options.modelName, tmpOptions).then(collection => {
                collection.moduleName = options.moduleName;
                collection.rawSchema = schema;
                collection.modelName = options.modelName;
                collection.schemaName = options.schemaName;
                collection.cache = options.cache;
                collection.dataBase = dataBase;
                collection.tenant = options.tntCode;
                collection.channel = options.channel;
                SYSTEM.createIndexes(collection).then(success => {
                    SYSTEM.LOG.debug('Indexes created for: ' + collection.schemaName + ' : ' + success);
                    SYSTEM.registerModelMiddleWare(options, collection, schema);
                    resolve(collection);
                }).catch(error => {
                    SYSTEM.LOG.error('Indexes failed for: ' + collection.schemaName + ' : ' + error);
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    retrieveModel: function (options, dataBase) {
        return new Promise((resolve, reject) => {
            let schema = options.moduleObject.rawSchema[options.schemaName];
            if (dataBase.getCollectionList().includes(options.modelName)) {
                let collection = dataBase.getConnection().collection(options.modelName);
                collection.moduleName = options.moduleName;
                collection.rawSchema = schema;
                collection.modelName = options.modelName;
                collection.schemaName = options.schemaName;
                collection.cache = options.cache;
                collection.dataBase = dataBase;
                collection.tenant = options.tntCode;
                collection.channel = options.channel;
                SYSTEM.registerModelMiddleWare(options, collection, schema);
                resolve(collection);
            } else {
                SYSTEM.createModel(options, dataBase).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    buildModel: function (options) {
        return new Promise((resolve, reject) => {
            options.modelName = UTILS.createModelName(options.schemaName);
            let schema = options.moduleObject.rawSchema[options.schemaName];
            if (options.dataBase.master && schema.model === true) {
                SYSTEM.prepareDatabaseOptions(options);
                let cache = _.merge({}, schema.cache || {});
                let itemLevelCache = CONFIG.get('cache').itemLevelCache;
                options.cache = _.merge(cache, itemLevelCache[options.schemaName] || {});
                options.channel = 'master';
                SYSTEM.retrieveModel(options, options.dataBase.master).then(success => {
                    if (!options.moduleObject.models[options.tntCode].master) {
                        options.moduleObject.models[options.tntCode].master = {};
                    }
                    options.moduleObject.models[options.tntCode].master[options.modelName] = success;
                    if (options.dataBase.test) {
                        options.channel = 'test';
                        SYSTEM.retrieveModel(options, options.dataBase.test).then(success => {
                            if (!options.moduleObject.models[options.tntCode].test) {
                                options.moduleObject.models[options.tntCode].test = {};
                            }
                            options.moduleObject.models[options.tntCode].test[options.modelName] = success;
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                }).catch(error => {
                    reject(error);
                });
            } else {
                SYSTEM.LOG.warn('Invalid database configuration for module: ', options.moduleName, ' and tenant: ', options.tntCode);
                resolve(true);
            }
        });
    },

    buildModels: function (options) {
        return new Promise((resolve, reject) => {
            options.schemaName = options.schemas.shift();
            SYSTEM.buildModel(options).then(success => {
                if (options.schemas.length > 0) {
                    SYSTEM.buildModels(options).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(success);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModelsForModule: function (tntCode, moduleName) {
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(moduleName);
            let dbConfig = NODICS.getDatabaseConfiguration(moduleName, tntCode);
            let dbType = dbConfig.databaseType;
            if (moduleObject && moduleObject.rawSchema) {
                if (!moduleObject.models) {
                    moduleObject.models = {};
                }
                if (!moduleObject.models[tntCode]) {
                    moduleObject.models[tntCode] = {};
                }
                let options = {
                    dbConfig: dbConfig,
                    dbType: dbType,
                    tntCode: tntCode,
                    moduleName: moduleName,
                    moduleObject: moduleObject,
                    dataBase: NODICS.getDatabase(moduleName, tntCode),
                    schemas: Object.keys(moduleObject.rawSchema),

                };
                SYSTEM.buildModels(options).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    buildModelsForModules: function (tntCode, modules) {
        return new Promise((resolve, reject) => {
            let moduleName = modules.shift();
            SYSTEM.buildModelsForModule(tntCode, moduleName).then(success => {
                if (modules.length > 0) {
                    SYSTEM.buildModelsForModules(tntCode, modules).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(success);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModelsForTenant: function (tntCode) {
        return new Promise((resolve, reject) => {
            SYSTEM.buildModelsForModules(tntCode, NODICS.getActiveModules()).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModelsForTenants: function (tenants = ['default']) {
        return new Promise((resolve, reject) => {
            let tntCode = tenants.shift();
            if (tntCode) {
                SYSTEM.buildModelsForTenant(tntCode).then(success => {
                    if (tenants.length > 0) {
                        SYSTEM.buildModelsForTenants(tenants).then(success => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(success);
                    }
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    resolveSchemaDependancy: function (mergedSchema, rawSchema, schemaName, schema) {
        if (schema.super) {
            let superSchemaName = schema.super;
            let superSchema = rawSchema[superSchemaName];
            if (superSchema) {
                let finalSchema = {};
                let parents = [];
                if (mergedSchema[superSchemaName]) {
                    finalSchema = mergedSchema[superSchemaName];
                } else {
                    finalSchema = SYSTEM.resolveSchemaDependancy(mergedSchema, rawSchema, superSchemaName, superSchema);
                }
                if (finalSchema.parents && finalSchema.parents.length > 0) {
                    finalSchema.parents.forEach(element => {
                        parents.push(element);
                    });
                }
                if (!parents.includes(superSchemaName)) {
                    parents.push(superSchemaName);
                }
                mergedSchema[schemaName] = _.merge(_.merge({}, finalSchema), schema);
                mergedSchema[schemaName].parents = parents;
                return mergedSchema[schemaName];
            } else {
                throw new Error('Invalid super schema definition for: ' + schemaName);
            }
        } else {
            mergedSchema[schemaName] = schema;
            return mergedSchema[schemaName];
        }
    },
    resolveModuleSchemaDependancy: function (moduleName, rawSchema) {
        let mergedSchema = {};
        Object.keys(rawSchema).forEach(schemaName => {
            if (!mergedSchema[schemaName]) {
                SYSTEM.resolveSchemaDependancy(mergedSchema, rawSchema, schemaName, rawSchema[schemaName]);
            }
        });
        return mergedSchema;
    },

    validateSchemaDefinition: function (modelName, schemaDefinition) {
        let flag = true;
        if (!schemaDefinition.super) {
            this.LOG.error('Invalid schema definition for : ' + modelName + ', please define super attribute');
            flag = false;
        } else if (!schemaDefinition.definition) {
            this.LOG.error('Invalid schema definition for : ' + modelName + ', please define definition attribute');
            flag = false;
        }
        return flag;
    },

    buildSchemas: function () {
        SYSTEM.LOG.debug('Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles('/src/schemas/schemas.js', null, true);
        let defaultSchema = mergedSchema.default || {};
        let modules = NODICS.getModules();
        Object.keys(mergedSchema).forEach(function (key) {
            if (key !== 'default') {
                let moduleObject = modules[key];
                if (!moduleObject) {
                    SYSTEM.LOG.error('Module name : ', key, ' is not valid. Please define a valide module name in schema');
                    process.exit(CONFIG.get('errorExitCode'));
                }
                moduleObject.rawSchema = SYSTEM.resolveModuleSchemaDependancy(key, _.merge(_.merge({}, defaultSchema), mergedSchema[key]));
            }
        });
        NODICS.setRawModels(SYSTEM.loadFiles('/src/schemas/model.js'));
    },

    addTenants: function () {
        return new Promise((resolve, reject) => {
            if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                SERVICE.DefaultTenantService.get({
                    tenant: 'default'
                }).then(tenantData => {
                    if (tenantData && tenantData.result && tenantData.result.length > 0) {
                        SYSTEM.handleTenants(tenantData.result).then(success => {
                            resolve(success);
                        }).catch((error) => {
                            SYSTEM.LOG.error(error);
                            reject('Configure at least default tenant');
                        });
                    } else {
                        reject('Configure at least default tenant');
                    }
                }).catch(error => {
                    SYSTEM.LOG.error(error);
                    reject('Configure at least default tenant');
                });
            } else {
                SYSTEM.fetchTenants().then(tenantData => {
                    SYSTEM.handleTenants(tenantData).then(success => {
                        resolve(success);
                    }).catch((error) => {
                        resolve(true);
                    });
                }).catch(error => {
                    resolve(true);
                });
            }
        });
    },

    fetchTenants: function () {
        return new Promise((resolve, reject) => {
            let requestUrl = SERVICE.DefaultModuleService.buildRequest({
                moduleName: 'profile',
                methodName: 'POST',
                apiName: '/tenant',
                requestBody: {},
                isJsonResponse: true,
                header: {
                    apiKey: CONFIG.get('apiKey')
                }
            });
            try {
                SERVICE.DefaultModuleService.fetch(requestUrl, (error, response) => {
                    if (error) {
                        SYSTEM.LOG.error('While connecting tenant server to fetch all active tenants', error);
                        resolve([]);
                    } else {
                        resolve(response.result || []);
                    }
                });
            } catch (error) {
                SYSTEM.LOG.error('While connecting tenant server to fetch all active tenants', error);
                resolve([]);
            }
        });
    },

    handleTenants: function (tenantData) {
        return new Promise((resolve, reject) => {
            if (!tenantData || tenantData.length <= 0) {
                reject('Configure at least default tenant');
            } else {
                try {
                    tenantData.forEach(element => {
                        if (element.active) {
                            NODICS.addTenant(element.code);
                            let tntConfig = _.merge({}, CONFIG.getProperties());
                            tntConfig = _.merge(tntConfig, element.properties);
                            CONFIG.setProperties(tntConfig, element.code);
                        }
                    });
                } catch (error) {
                    SYSTEM.LOG.error(error);
                }
                resolve(true);
            }
        });
    },

    createTenantDatabaseConnection: function () {
        return new Promise((resolve, reject) => {
            let allTenant = [];
            let tenants = NODICS.getTenants() || [];
            tenants.forEach(function (tntCode) {
                if (tntCode !== 'default') {
                    allTenant.push(SYSTEM.createTenantDatabase(tntCode));
                }
            });
            if (allTenant.length > 0) {
                Promise.all(allTenant).then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    loadTenantDatabase: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            SYSTEM.createTenantDatabaseConnection().then(success => {
                let tenants = NODICS.getTenants().slice(0);
                var index = tenants.indexOf('default');
                if (index > -1) {
                    tenants.splice(index, 1);
                }
                _self.buildModelsForTenants(tenants).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
};