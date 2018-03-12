/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const mongoose = require('mongoose');

module.exports = {
    createConnection: function(dbConfig, tntName, type) {
        return new Promise((resolve, reject) => {
            console.log('   INFO: Creating database connection for URI : ', dbConfig.URI);
            let connection = '';
            mongoose.Promise = global.Promise;
            if (dbConfig.options) {
                connection = mongoose.createConnection(dbConfig.URI, dbConfig.options);
            } else {
                connection = mongoose.createConnection(dbConfig.URI);
            }
            //Register all posible event
            connection.on('connected', function() {
                console.log('   INFO: Mongoose default connection open to ' + dbConfig.URI);
                resolve(connection);
                try {
                    if (type === 'master' && tntName === 'default') {
                        connection.db.collection('enterprisemodels', function(err, collection) {
                            collection.count({}, function(error, count) {
                                if (count <= 0 || CONFIG.get('database').processInitialData) {
                                    NODICS.setInitRequired(true);
                                }
                            });
                        });
                    }
                } catch (error) {
                    console.log('   ERROR: While checking if initialization required : ', error);
                }

            });
            connection.on('error', function(error) {
                console.log('   INFO: Mongoose default connection error: ' + error);
                reject('Mongoose default connection error: ' + error);
            });
            connection.on('disconnected', function() {
                console.log('   INFO: Mongoose default connection disconnected');
            });
        });
    },
    createDatabase: function(moduleName, tntName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let tntDB = {};
            let dbConfig = NODICS.getDatabaseConfiguration(moduleName, tntName);
            let testConfig = CONFIG.get('test');
            let masterDatabase = new CLASSES.Database();
            let testDatabase = null;

            masterDatabase.setName(moduleName);
            masterDatabase.setURI(dbConfig.master.URI);
            masterDatabase.setOptions(dbConfig.master.options);
            _self.createConnection(dbConfig.master, tntName, 'master').then(connection => {
                masterDatabase.setConnection(connection);
                masterDatabase.setSchema(mongoose.Schema);
                if (testConfig.enabled && testConfig.uTest.enabled) {
                    testDatabase = new CLASSES.Database();
                    if (dbConfig.test) {
                        testDatabase.setName(moduleName);
                        testDatabase.setURI(dbConfig.test.URI);
                        testDatabase.setOptions(dbConfig.test.options);
                        _self.createConnection(dbConfig.test, tntName, 'test').then(conn => {
                            testDatabase.setConnection(conn);
                            testDatabase.setSchema(mongoose.Schema);
                            NODICS.addTenantDatabase(moduleName, tntName, {
                                master: masterDatabase,
                                test: testDatabase
                            });
                            resolve();
                        }).catch(error => {
                            reject('Could not connect test database : ' + error);
                        });
                    } else {
                        let testDB = NODICS.getDatabase().test;
                        if (!testDB) {
                            console.error('   ERROR: Default test database configuration not found. Please velidate database configuration');
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

    walkthroughTenants: function(moduleName) {
        return new Promise((resolve, reject) => {
            const _self = this;
            let allTenant = [];
            CONFIG.get('installedTanents').forEach(function(tntName) {
                allTenant.push(_self.createDatabase(moduleName, tntName));
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

    createDatabases: function() {
        const _self = this;
        return new Promise((resolve, reject) => {
            if (!SYSTEM.validateDatabaseConfiguration()) {
                process.exit(CONFIG.get('errorExitCode'));
            }
            _self.walkthroughTenants('default').then(success => {
                let modules = NODICS.getModules();
                let allModules = [];
                _.each(modules, (value, moduleName) => {
                    if (CONFIG.get('database')[moduleName]) {
                        allModules.push(_self.walkthroughTenants(moduleName));
                    }
                });
                if (allModules.length > 0) {
                    Promise.all(allModules).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },
    init: function() {
        console.log(" =>Starting Database creating process");
        return this.createDatabases();
    }
};