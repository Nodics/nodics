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

    createConnection: function (dbType, dbConfig, tntName, type) {
        if (dbType === 'mysql') {

        } else {
            return this.createMongoDBConnection(dbConfig, tntName, type);
        }
    },

    createMongoDBConnection: function (dbConfig, tntName, type) {
        return new Promise((resolve, reject) => {
            SYSTEM.LOG.debug('Creating ', type, ' database connection for tenant: ', tntName, ' URI: ', dbConfig.URI, ' DB Name: ', dbConfig.databaseName);
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

            /*let connection = '';
            mongoose.Promise = global.Promise;
            let url = dbConfig.URI + '/' + dbConfig.databaseName;
            if (dbConfig.options) {
                connection = mongoose.createConnection(url, dbConfig.options);
            } else {
                connection = mongoose.createConnection(url);
            }
            //Register all posible event
            connection.on('connected', function () {
                SYSTEM.LOG.info('Mongoose default connection open to ' + url);
                resolve(connection);
            });
            connection.on('error', function (error) {
                SYSTEM.LOG.error('Mongoose default connection error: ' + error);
                reject('Mongoose default connection error: ' + error);
            });
            connection.on('disconnected', function () {
                SYSTEM.LOG.info('Mongoose default connection disconnected');
            });*/
        });
    },

    createDatabase: function (moduleName, tntName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let dbConfig = NODICS.getDatabaseConfiguration(moduleName, tntName);
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
            _self.createConnection(dbType, dbConfig[dbType].master, tntName, 'master').then(result => {
                masterDatabase.setConnection(result.connection);
                masterDatabase.setCollections(result.collections);
                if (testConfig.enabled && testConfig.uTest.enabled) {
                    testDatabase = new CLASSES.Database();
                    if (dbConfig[dbType].test) {
                        testDatabase.setName(moduleName);
                        testDatabase.setURI(dbConfig[dbType].test.URI);
                        testDatabase.setOptions(dbConfig[dbType].test.options);
                        _self.createConnection(dbType, dbConfig[dbType].test, tntName, 'test').then(response => {
                            testDatabase.setConnection(response.connection);
                            testDatabase.setCollections(result.collections);
                            NODICS.addTenantDatabase(moduleName, tntName, {
                                master: masterDatabase,
                                test: testDatabase
                            });
                            resolve();
                        }).catch(error => {
                            reject('Could not connect test database : ' + error);
                        });
                    } else {
                        let testDB = NODICS.getDatabase('default', tntName).test;
                        if (!testDB) {
                            SYSTEM.LOG.error('Default test database configuration not found. Please velidate database configuration');
                            process.exit(CONFIG.get('errorExitCode'));
                        } {

                        }
                        NODICS.addTenantDatabase(moduleName, tntName, {
                            master: masterDatabase,
                            test: testDB
                        });
                        resolve();
                    }
                } else {
                    NODICS.addTenantDatabase(moduleName, tntName, {
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

    createTenantDatabase: function (tntName) {
        return new Promise((resolve, reject) => {
            let dbModules = SYSTEM.prepareDatabaseList();
            dbModules.splice(dbModules.indexOf('default'), 1);
            SYSTEM.createDatabase('default', tntName).then(success => {
                let allModules = [];
                dbModules.forEach(moduleName => {
                    allModules.push(SYSTEM.createDatabase(moduleName, tntName));
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

    createModel: function (options, dataBase) {
        return new Promise((resolve, reject) => {
            let schema = options.moduleObject.rawSchema[options.schemaName];
            let schemaOptions = {};
            if (schema.options && schema.options[options.dbType]) {
                schemaOptions = schema.options[options.dbType];
            }
            dataBase.getConnection().createCollection(options.modelName, schemaOptions).then(collection => {
                collection.modelName = options.modelName;
                collection.schemaName = options.schemaName;
                SYSTEM.registerModelMiddleWare(options, collection, schema);
                resolve(collection);
            }).catch(error => {
                reject(error);
            });
        });
    },

    retrieveModel: function (options, dataBase) {
        return new Promise((resolve, reject) => {
            if (dataBase.getCollectionList().includes(options.modelName)) {
                let collection = dataBase.getConnection().collection(options.modelName);
                let schema = options.moduleObject.rawSchema[options.schemaName];
                collection.moduleName = options.moduleName;
                collection.rawSchema = schema;
                collection.modelName = options.modelName;
                collection.schemaName = options.schemaName;
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
            options.modelName = SYSTEM.createModelName(options.schemaName);
            if (options.dataBase.master) {
                SYSTEM.retrieveModel(options, options.dataBase.master).then(success => {
                    if (!options.moduleObject.models[options.tenant].master) {
                        options.moduleObject.models[options.tenant].master = {};
                    }
                    options.moduleObject.models[options.tenant].master[options.modelName] = success;
                    if (options.dataBase.test) {
                        SYSTEM.retrieveModel(options, options.dataBase.test).then(success => {
                            if (!options.moduleObject.models[options.tenant].test) {
                                options.moduleObject.models[options.tenant].test = {};
                            }
                            options.moduleObject.models[options.tenant].test[options.modelName] = success;
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
                SYSTEM.LOG.warn('Invalid database configuration for module: ', options.moduleName, ' and tenant: ', options.tenant);
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

    buildModelsForModule: function (tenant, moduleName) {
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(moduleName);
            let dbConfig = NODICS.getDatabaseConfiguration(moduleName, tenant);
            let dbType = dbConfig.databaseType;
            if (moduleObject && moduleObject.rawSchema) {
                if (!moduleObject.models) {
                    moduleObject.models = {};
                }
                if (!moduleObject.models[tenant]) {
                    moduleObject.models[tenant] = {};
                }
                let options = {
                    dbConfig: dbConfig,
                    dbType: dbType,
                    tenant: tenant,
                    moduleName: moduleName,
                    moduleObject: moduleObject,
                    dataBase: NODICS.getDatabase(moduleName, tenant),
                    schemas: Object.keys(moduleObject.rawSchema),

                }
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

    buildModelsForModules: function (tenant, modules) {
        return new Promise((resolve, reject) => {
            let moduleName = modules.shift();
            SYSTEM.buildModelsForModule(tenant, moduleName).then(success => {
                if (modules.length > 0) {
                    SYSTEM.buildModelsForModules(tenant, modules).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(success)
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModelsForTenant: function (tenant) {
        return new Promise((resolve, reject) => {
            SYSTEM.buildModelsForModules(tenant, NODICS.getActiveModules()).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildModelsForTenants: function (tenants = ['default']) {
        return new Promise((resolve, reject) => {
            let tenant = tenants.shift();
            SYSTEM.buildModelsForTenant(tenant).then(success => {
                if (tenants.length > 0) {
                    SYSTEM.buildModelsForTenants(tenants).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    })
                } else {
                    resolve(success);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildSchemas: function () {
        SYSTEM.LOG.debug('Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles('/src/schemas/schemas.js', null, true);
        let modules = NODICS.getModules();
        Object.keys(mergedSchema).forEach(function (key) {
            if (key !== 'default') {
                let moduleObject = modules[key];
                if (!moduleObject) {
                    SYSTEM.LOG.error('Module name : ', key, ' is not valid. Please define a valide module name in schema');
                    process.exit(CONFIG.get('errorExitCode'));
                }
                moduleObject.rawSchema = mergedSchema[key];
            }
        });
        NODICS.setRawModels(SYSTEM.loadFiles('/src/schemas/model.js'));
    },



    createModelName: function (modelName) {
        var name = modelName.toUpperCaseFirstChar() + 'Model';
        return name;
    },

    getModelName: function (modelName) {
        var name = modelName.toUpperCaseFirstChar().replace("Model", "");
        return name;
    },

    addTenants: function () {
        return new Promise((resolve, reject) => {
            if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                SERVICE.DefaultTenantService.get({
                    tenant: 'default'
                }).then(tenantData => {
                    SYSTEM.handleTenants(tenantData).then(success => {
                        resolve(success);
                    }).catch((error) => {
                        SYSTEM.LOG.error(error);
                        reject('Configure at least default tenant');
                    });
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
                methodName: 'GET',
                apiName: 'tenant/get',
                requestBody: {},
                isJsonResponse: true,
            });
            try {
                SERVICE.DefaultModuleService.fetch(requestUrl, (error, response) => {
                    if (error) {
                        SYSTEM.LOG.error('While connecting tenant server to fetch all active tenants', error);
                        resolve([]);
                    } else {
                        resolve(response.result);
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
                            NODICS.addTenant(element.name);
                            let tntConfig = _.merge({}, CONFIG.getProperties());
                            tntConfig = _.merge(tntConfig, element.properties);
                            CONFIG.setProperties(tntConfig, element.name);
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
            tenants.forEach(function (tntName) {
                if (tntName !== 'default') {
                    allTenant.push(SYSTEM.createTenantDatabase(tntName));
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
    },

    // ******************************************


    deployValidators: function () {
        SYSTEM.LOG.debug('Starting validators loading process');
        NODICS.setValidators(SYSTEM.loadFiles('/src/schemas/validators.js'));
    },


    interceptorMiddleware: function (interceptors, moduleSchema, modelName) {
        if (!UTILS.isBlank(interceptors)) {
            let interceptorFunctions = SYSTEM.getAllMethods(interceptors);
            interceptorFunctions.forEach(function (operationName) {
                interceptors[operationName](moduleSchema, modelName);
            });
        }
    },

    modelDaoMiddleware: function (dao, moduleSchema, schemaDef) {
        if (!UTILS.isBlank(dao)) {
            let daoFunctions = SYSTEM.getAllMethods(dao);
            daoFunctions.forEach(function (operationName) {
                dao[operationName](moduleSchema, schemaDef);
                dao[operationName](moduleSchema, schemaDef);
            });
        }
    },

    registerSchemaMiddleWare: function (options) {
        SYSTEM.interceptorMiddleware(options.interceptors.default, options.modelSchema, options.modelName);
        if (options.interceptors[options.moduleName]) {
            SYSTEM.interceptorMiddleware(options.interceptors[options.moduleName].default, options.modelSchema, options.modelName);
            SYSTEM.interceptorMiddleware(options.interceptors[options.moduleName][options.modelName], options.modelSchema, options.modelName);
        }

        SYSTEM.modelDaoMiddleware(options.daos.default, options.modelSchema, options.schemaDef);
        if (options.daos[options.moduleName]) {
            SYSTEM.modelDaoMiddleware(options.daos[options.moduleName].default, options.modelSchema, options.schemaDef);
            SYSTEM.modelDaoMiddleware(options.daos[options.moduleName][options.modelName], options.modelSchema, options.schemaDef);
        }
    },

    createModelObject: function (options) {
        let modelName = SYSTEM.createModelName(options.modelName);
        options.modelObject[modelName] = options.database.getConnection().model(modelName, options.modelSchema);
    },

    createSchema: function (options) {
        let schemas = options.schemaObject;
        let models = options.modelObject;
        let rawSchema = NODICS.getModule(options.moduleName).rawSchema;
        if (options.schemaDef.super === 'none') {
            options.schemaObject[options.modelName] = new options.database.getSchema()(options.schemaDef.definition, options.schemaDef.options || {});
        } else {
            let superSchema = options.schemaDef.super;
            if (!options.schemaObject[superSchema]) {
                let tmpOptions = _.merge({}, options);
                tmpOptions.schemaDef = rawSchema[superSchema];
                tmpOptions.modelName = superSchema;
                SYSTEM.resolveSchemaDependancy(tmpOptions);
            }
            try {
                let tmpDef = _.merge({}, rawSchema[superSchema].definition);
                _.merge(tmpDef, options.schemaDef.definition);
                rawSchema[options.modelName].definition = tmpDef;
                options.schemaObject[options.modelName] = new options.database.getSchema()(rawSchema[options.modelName].definition, rawSchema[options.modelName].options || {});
            } catch (error) {
                SYSTEM.LOG.error('While generating models : ', error);
            }
        }
        if (options.schemaDef.model) {
            options.modelSchema = options.schemaObject[options.modelName];
            options.modelSchema.moduleName = options.schemaDef.moduleName;
            options.modelSchema.modelName = SYSTEM.createModelName(options.modelName);
            options.modelSchema.rawSchema = options.schemaDef;
            options.modelSchema.LOG = SYSTEM.createLogger(options.modelName.toUpperCaseEachWord() + 'Interceptor');
            SYSTEM.registerSchemaMiddleWare(options);
            SYSTEM.createModelObject(options);
        }
    },

    resolveSchemaDependancy: function (options) {
        let flag = false;
        options.tenants.forEach(function (tntName) {
            flag = false;
            options.schemaDef.tenant = tntName;
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
                SYSTEM.createSchema(options);
                flag = true;
            }
            if (!schemaObject[tntName].test[options.modelName] && database.test) {
                options.database = database.test;
                options.schemaObject = schemaObject[tntName].test;
                options.modelObject = modelObject[tntName].test;
                SYSTEM.createSchema(options);
                flag = true;
            }
        });
        return flag;
    },

    traverseSchemas: function (options) {
        let cloneSchema = _.merge({}, options.rawSchema);

        _.each(options.rawSchema, function (valueIn, keyIn) {
            options.modelName = keyIn;
            options.schemaDef = valueIn;
            options.schemaDef.moduleName = options.moduleName;
            options.schemaDef.modelName = keyIn;
            if (SYSTEM.resolveSchemaDependancy(options)) {
                delete cloneSchema[keyIn];
            }
        });
        return cloneSchema;
    },

    extractRawSchema: function (options) {
        options.rawSchema = _.merge({}, options.moduleObject.rawSchema);
        let loop = true;
        let counter = 0;
        do {
            options.rawSchema = SYSTEM.traverseSchemas(options);
            if (_.isEmpty(options.rawSchema)) {
                loop = false;
            }
        } while (loop && counter++ < 10);
    },

    createSchemas: function (options) {
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
                SYSTEM.extractRawSchema(options);
            }
        });
    },

    deployRawSchemas: function () {
        SYSTEM.LOG.debug('Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles('/src/schemas/schemas.js', null, true);
        let modules = NODICS.getModules();
        Object.keys(mergedSchema).forEach(function (key) {
            if (key !== 'default') {
                let moduleObject = modules[key];
                if (!moduleObject) {
                    SYSTEM.LOG.error('Module name : ', key, ' is not valid. Please define a valide module name in schema');
                    process.exit(CONFIG.get('errorExitCode'));
                }
                moduleObject.rawSchema = _.merge(mergedSchema[key], mergedSchema.default);
            }
        });
    },

    deploySchemas: function (tenants) {
        SYSTEM.LOG.debug('Starting schemas loading process');
        let mergedSchema = SYSTEM.loadFiles('/src/schemas/schemas.js', null, true);
        let options = {
            interceptors: SYSTEM.loadFiles('/src/schemas/interceptors.js'),
            daos: SYSTEM.loadFiles('/src/schemas/model.js'),
            schemas: mergedSchema,
            tenants: tenants || ['default']
        };
        let modules = NODICS.getModules();
        Object.keys(mergedSchema).forEach(function (key) {
            if (key !== 'default') {
                let moduleObject = modules[key];
                if (!moduleObject) {
                    SYSTEM.LOG.error('Module name : ', key, ' is not valid. Please define a valide module name in schema');
                    process.exit(CONFIG.get('errorExitCode'));
                }
                moduleObject.rawSchema = _.merge(mergedSchema[key], mergedSchema.default);

            }
        });
        //SYSTEM.createSchemas(options);
    },

    // **********************************************************



    validateSchemaDefinition: function (modelName, schemaDefinition) {
        let flag = true;
        if (!schemaDefinition.super) {
            this.LOG.error('Invalid schema definition for : ' + modelName + ', please define super attribute');
            flag = false;
        } else if (!schemaDefinition.definition) {
            this.LOG.error('Invalid schema definition for : ' + modelName + ', please define definition attribute');
            flag = false;
        }
    },

    buildItemLevelCache: function (rawSchema) {
        let itemLevelCache = CONFIG.get('cache').itemLevelCache[rawSchema.modelName];
        if (itemLevelCache) {
            rawSchema.cache = itemLevelCache;
        }
    }
};