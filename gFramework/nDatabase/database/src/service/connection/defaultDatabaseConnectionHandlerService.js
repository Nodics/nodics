/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },


    removeTenantDatabase: function (moduleName, tntCode) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultDatabaseConfigurationService.removeTenantDatabase(moduleName, tntCode);
            resolve(true);
        });
    },

    createDatabaseConnection: function (tntCode = 'default', onlyDefault = false) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let dbModules = SERVICE.DefaultDatabaseConfigurationService.getDatabaseActiveModules();
                dbModules.splice(dbModules.indexOf('default'), 1);
                _self.createDatabase('default', tntCode).then(success => {
                    let allModules = [];
                    if (!onlyDefault) {
                        dbModules.forEach(moduleName => {
                            allModules.push(_self.createDatabase(moduleName, tntCode));
                        });
                    }
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
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            }
        });
    },

    createDatabase: function (moduleName, tntCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let dbConfig = SERVICE.DefaultDatabaseConfigurationService.getDatabaseConfiguration(moduleName, tntCode);
                if (dbConfig && !UTILS.isBlank(dbConfig.options) && dbConfig.options.connectionHandler) {
                    let testConfig = CONFIG.get('test');
                    let masterDatabase = new CLASSES.Database();
                    let testDatabase = null;
                    masterDatabase.setName(moduleName);
                    masterDatabase.setURI(dbConfig.master.URI);
                    masterDatabase.setOptions(dbConfig.options);
                    masterDatabase.setConnectionOptions(dbConfig.master.options);
                    if (SERVICE[dbConfig.options.connectionHandler] &&
                        SERVICE[dbConfig.options.connectionHandler].createConnection && typeof SERVICE[dbConfig.options.connectionHandler].createConnection === 'function') {
                        _self.LOG.info('Connecting database for tenant: ' + tntCode);
                        SERVICE[dbConfig.options.connectionHandler].createConnection(dbConfig.master).then(success => {
                            masterDatabase.setConnection(success.connection);
                            masterDatabase.setCollections(success.collections);
                            masterDatabase.setClient(success.client);
                            if (testConfig.enabled && testConfig.uTest.enabled) {
                                testDatabase = new CLASSES.Database();
                                if (dbConfig.test) {
                                    testDatabase.setName(moduleName);
                                    testDatabase.setURI(dbConfig.test.URI);
                                    testDatabase.setOptions(dbConfig.options);
                                    masterDatabase.setConnectionOptions(dbConfig.test.options);
                                    SERVICE[dbConfig.options.connectionHandler].createConnection(dbConfig.test).then(success => {
                                        testDatabase.setConnection(success.connection);
                                        testDatabase.setCollections(success.collections);
                                        testDatabase.setClient(success.client);
                                        SERVICE.DefaultDatabaseConfigurationService.addTenantDatabase(moduleName, tntCode, {
                                            master: masterDatabase,
                                            test: testDatabase
                                        });
                                        resolve();
                                    }).catch(error => {
                                        reject('Could not connect test database : ' + error);
                                    });
                                } else {
                                    let testDB = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase('default', tntCode).test;
                                    if (!testDB) {
                                        _self.LOG.error('Default test database configuration not found. Please velidate database configuration');
                                        process.exit(CONFIG.get('errorExitCode'));
                                    }
                                    SERVICE.DefaultDatabaseConfigurationService.addTenantDatabase(moduleName, tntCode, {
                                        master: masterDatabase,
                                        test: testDB
                                    });
                                    resolve();
                                }
                            } else {
                                SERVICE.DefaultDatabaseConfigurationService.addTenantDatabase(moduleName, tntCode, {
                                    master: masterDatabase,
                                    test: testDatabase
                                });
                                resolve();
                            }
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database configuration for connection handler found for module: ' + moduleName + ', and tenant: ' + tntCode));
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database configuration found for module: ' + moduleName + ', and tenant: ' + tntCode));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'MongoDB default connection error', 'ERR_DBS_00000'));
            }
        });
    },

    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(CONFIG.get('profileModuleName'), 'default');
                if (dbConnection) {
                    let masterDatabase = dbConnection.master;
                    if (SERVICE[masterDatabase.getOptions().connectionHandler] &&
                        SERVICE[masterDatabase.getOptions().connectionHandler].isInitRequired &&
                        typeof SERVICE[masterDatabase.getOptions().connectionHandler].isInitRequired === 'function') {
                        SERVICE[masterDatabase.getOptions().connectionHandler].isInitRequired(masterDatabase).then(isRequired => {
                            _self.LOG.info(' ###  Database initialization required: ' + isRequired + '  ### ');
                            NODICS.setInitRequired(isRequired);
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database configuration for connection handler found for module: ' + CONFIG.get('profileModuleName') + ', and tenant: default'));
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database connection handler found for module: ' + CONFIG.get('profileModuleName') + ', and tenant: default'));
                }
            } else {
                resolve(true);
            }
        });
    },

    getRuntimeSchema: function () {
        return new Promise((resolve, reject) => {
            let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase('default', 'default');
            if (dbConnection) {
                let masterDatabase = dbConnection.master;
                if (SERVICE[masterDatabase.getOptions().connectionHandler] &&
                    SERVICE[masterDatabase.getOptions().connectionHandler].getRuntimeSchema &&
                    typeof SERVICE[masterDatabase.getOptions().connectionHandler].getRuntimeSchema === 'function') {
                    SERVICE[masterDatabase.getOptions().connectionHandler].getRuntimeSchema(masterDatabase).then(schemas => {
                        this.LOG.info(' ###  Found runtime schemas ' + schemas.length);
                        let runtimeSchema = {};
                        if (schemas && schemas.length > 0) {
                            schemas.forEach(schema => {
                                if (!runtimeSchema[schema.moduleName]) runtimeSchema[schema.moduleName] = {};
                                if (runtimeSchema[schema.moduleName][schema.code]) {
                                    runtimeSchema[schema.moduleName][schema.code] = _.merge(runtimeSchema[schema.moduleName][schema.code], schema);
                                } else {
                                    runtimeSchema[schema.moduleName][schema.code] = schema;
                                }
                            });
                        }
                        resolve(runtimeSchema);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database configuration for connection handler found for module: default, and tenant: default'));
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database connection handler found for module: default, and tenant: default'));
            }
        });
    },

    closeConnection: function (moduleName, tntCode) {
        let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, tntCode);
        if (dbConnection) {
            let masterDatabase = dbConnection.master;
            if (masterDatabase && SERVICE[masterDatabase.getOptions().connectionHandler] &&
                SERVICE[masterDatabase.getOptions().connectionHandler].getRuntimeSchema &&
                typeof SERVICE[masterDatabase.getOptions().connectionHandler].getRuntimeSchema === 'function') {
                SERVICE[masterDatabase.getOptions().connectionHandler].closeConnection(masterDatabase);
            }

            let testDatabase = dbConnection.test;
            if (testDatabase && SERVICE[testDatabase.getOptions().connectionHandler] &&
                SERVICE[testDatabase.getOptions().connectionHandler].getRuntimeSchema &&
                typeof SERVICE[testDatabase.getOptions().connectionHandler].getRuntimeSchema === 'function') {
                SERVICE[testDatabase.getOptions().connectionHandler].closeConnection(testDatabase);
            }
        }
    }
};