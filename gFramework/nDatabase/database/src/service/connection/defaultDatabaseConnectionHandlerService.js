/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/connection/DefaultDatabaseConnectionHandlerService
 * @description Coordinates tenant and module database connection lifecycle for
 * Nodics. It creates default and module-specific database handles, registers
 * them in the runtime registry, detects initialization requirements, retrieves
 * runtime schemas, and closes active connections.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize tenant
 * connection strategy, database bootstrap, runtime schema retrieval, or channel
 * handling while preserving module/tenant scoped connection registration.
 *
 * @property {Object} SERVICE.DefaultDatabaseConfigurationService Resolves and stores tenant database handles.
 * @property {Object} SERVICE[connectionHandler] Database-specific connection adapter.
 * @property {Object} CONFIG.database Layered database configuration.
 * @property {Object} CONFIG.test.uTest Test channel configuration.
 */
module.exports = {
    /**
     * Initializes the database connection handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        if (SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('databaseConnections', {
                order: 600,
                shutdown: () => this.closeAllConnections()
            });
        }
        if (SERVICE.DefaultHealthService) {
            SERVICE.DefaultHealthService.registerReadinessContributor('databaseConnections', {
                required: true,
                order: 100,
                description: 'Required tenant database handles are initialized',
                check: () => this.areRequiredConnectionsReady()
            });
        }
        return Promise.resolve(true);
    },

    /**
     * Finalizes the database connection handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /** Checks existing required tenant database handles without opening probe connections. */
    areRequiredConnectionsReady: function () {
        let modules = SERVICE.DefaultDatabaseConfigurationService.getDatabaseActiveModules();
        let tenants = NODICS.getActiveTenants();
        if (tenants.length === 0) tenants = [CONFIG.get('defaultTenant') || 'default'];
        return modules.every(moduleName => tenants.every(tenant => {
            let value;
            try { value = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, tenant); } catch (error) { return false; }
            return !!(value && value.master && value.master.getConnection && value.master.getConnection());
        }));
    },

    /** Closes all registered module and tenant database handles during shutdown. */
    closeAllConnections: function () {
        let modules = SERVICE.DefaultDatabaseConfigurationService.getDatabaseActiveModules();
        let tenants = NODICS.getActiveTenants();
        if (tenants.length === 0) tenants = [CONFIG.get('defaultTenant') || 'default'];
        modules.forEach(moduleName => tenants.forEach(tenant => this.closeConnection(moduleName, tenant)));
        return Promise.resolve(true);
    },

    /**
     * Removes a registered tenant database handle.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tntCode Tenant code.
     * @returns {Promise<boolean>} Resolves after the registry entry is removed.
     * @sideEffects Mutates the database configuration service registry.
     */
    removeTenantDatabase: function (moduleName, tntCode) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultDatabaseConfigurationService.removeTenantDatabase(moduleName, tntCode);
            resolve(true);
        });
    },

    /**
     * Creates database connections for the default database and optionally all database-enabled modules.
     *
     * @param {string} [tntCode] Tenant code. Falls back to configured default tenant.
     * @param {boolean} [onlyDefault=false] When true, only the default database is connected.
     * @returns {Promise<boolean>} Resolves after connections are registered.
     * @throws {CLASSES.NodicsError} When connection configuration or adapter execution fails.
     */
    createDatabaseConnection: function (tntCode, onlyDefault = false) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                tntCode = tntCode || CONFIG.get('defaultTenant') || 'default';
                let dbModules = SERVICE.DefaultDatabaseConfigurationService.getDatabaseActiveModules();
                let defaultIndex = dbModules.indexOf('default');
                if (defaultIndex >= 0) {
                    dbModules.splice(defaultIndex, 1);
                }
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

    /**
     * Creates and registers master/test database handles for one module and tenant.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tntCode Tenant code.
     * @returns {Promise<void>} Resolves when the module database handles are registered.
     * @sideEffects Adds tenant database handles to `DefaultDatabaseConfigurationService`.
     * @throws {CLASSES.NodicsError|string} When configuration or connection creation fails.
     */
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

    /**
     * Detects whether database initialization is required for the default tenant.
     *
     * @returns {Promise<boolean>} Resolves after `NODICS.initRequired` is updated.
     * @sideEffects Updates the global Nodics initialization-required flag.
     * @throws {CLASSES.NodicsError} When profile database connection handler is invalid.
     */
    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                let profileModuleName = CONFIG.get('profileModuleName');
                let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(profileModuleName, defaultTenant);
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
                        reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database configuration for connection handler found for module: ' + profileModuleName + ', and tenant: ' + defaultTenant));
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database connection handler found for module: ' + profileModuleName + ', and tenant: ' + defaultTenant));
                }
            } else {
                resolve(true);
            }
        });
    },

    /**
     * Retrieves runtime schema definitions from the default tenant database.
     *
     * @returns {Promise<Object>} Runtime schema map grouped by module and schema code.
     * @throws {CLASSES.NodicsError} When the default database or handler is unavailable.
     */
    getRuntimeSchema: function () {
        return new Promise((resolve, reject) => {
            let defaultTenant = CONFIG.get('defaultTenant') || 'default';
            let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase('default', defaultTenant);
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
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database configuration for connection handler found for module: default, and tenant: ' + defaultTenant));
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid database connection handler found for module: default, and tenant: ' + defaultTenant));
            }
        });
    },

    /**
     * Closes master and test database connections for one module and tenant.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tntCode Tenant code.
     * @returns {undefined}
     * @sideEffects Delegates connection closure to the configured connection handler.
     */
    closeConnection: function (moduleName, tntCode) {
        let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, tntCode);
        if (dbConnection) {
            let masterDatabase = dbConnection.master;
            if (masterDatabase && SERVICE[masterDatabase.getOptions().connectionHandler] &&
                SERVICE[masterDatabase.getOptions().connectionHandler].closeConnection &&
                typeof SERVICE[masterDatabase.getOptions().connectionHandler].closeConnection === 'function') {
                SERVICE[masterDatabase.getOptions().connectionHandler].closeConnection(masterDatabase);
            }

            let testDatabase = dbConnection.test;
            if (testDatabase && SERVICE[testDatabase.getOptions().connectionHandler] &&
                SERVICE[testDatabase.getOptions().connectionHandler].closeConnection &&
                typeof SERVICE[testDatabase.getOptions().connectionHandler].closeConnection === 'function') {
                SERVICE[testDatabase.getOptions().connectionHandler].closeConnection(testDatabase);
            }
        }
    }
};
