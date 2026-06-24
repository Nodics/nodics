/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const config = require('./nConfig');
const env = require('../env');
const util = require('util');

/**
 * @module gFramework/NodicsFramework
 * @description Coordinates Nodics runtime initialization, layered mandatory bootstrap hooks, server startup, generators, clean, and build lifecycles for the active module hierarchy.
 * @layer module
 * @owner gFramework
 * @override Projects customize behavior through active-module metadata, configuration, scripts, services, and configured bootstrap reconcilers rather than modifying this coordinator.
 */
module.exports = {
    /**
    * This function is used to initiate module loading process. If there is any functionalities, required to be executed on module loading. 
    * defined it that with Promise way
    * @param {*} options 
    */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize module loading process. If there is any functionalities, required to be executed after module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /** Initializes modules, entities, init data, bootstrap reconcilers, internal authentication, and enterprises. */
    initFramework: function (options) {
        return new Promise((resolve, reject) => {
            config.start(options).then(() => {
                return config.initUtilities(options);
            }).then(() => {
                return config.loadModules();
            }).then(() => {
                return config.initEntities();
            }).then(() => {
                return config.finalizeEntities();
            }).then(() => {
                return config.finalizeModules();
            }).then(() => {
                return SERVICE.DefaultScriptsHandlerService.executePostScripts();
            }).then(() => {
                return new Promise((resolve, reject) => {
                    if (NODICS.isInitRequired()) {
                        let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                        SERVICE.DefaultImportService.importInitData({
                            tenant: defaultTenant,
                            modules: NODICS.getActiveModules()
                        }).then(success => {
                            resolve(success);
                        }).catch(error => {
                            NODICS.LOG.error('Initial data import failed : ', error);
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                });
            }).then(() => {
                return this.executeMandatoryBootstrapServices();
            }).then(() => {
                return new Promise((resolve, reject) => {
                    if (NODICS.isInitRequired()) {
                        this.LOG.debug('Updating schema and workflow association');
                        SERVICE.DefaultWorkflow2SchemaService.buildWorkflow2SchemaAssociations().then(done => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                });
            }).then(() => {
                return new Promise((resolve, reject) => {
                    let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                    if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                        let defaultAuthDetail = CONFIG.get('defaultAuthDetail') || {};
                        SERVICE.DefaultEmployeeService.findByAPIKey({
                            tenant: defaultAuthDetail.tenant,
                            apiKey: CONFIG.get('defaultAuthDetail').apiKey
                        }).then(employee => {
                            SERVICE.DefaultServiceTokenService.issue({
                                entCode: defaultAuthDetail.entCode,
                                tenant: defaultAuthDetail.tenant,
                                serviceId: defaultAuthDetail.loginId || 'nodics-runtime',
                                authVersion: employee.authVersion || 1,
                                userGroups: employee.userGroupCodes,
                                permissions: employee.userGroupPermissions
                            }).then(authToken => {
                                NODICS.addInternalAuthToken(defaultTenant, authToken);
                                resolve(true);
                            }).catch(reject);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(defaultTenant).then(success => {
                            NODICS.addInternalAuthToken(defaultTenant, success.authToken);
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                });
            }).then(() => {
                return new Promise((resolve, reject) => {
                    SERVICE.DefaultEnterpriseHandlerService.buildEnterprises().then(success => {
                        resolve(true);
                    }).catch(error => {
                        NODICS.LOG.error('Either there are no tenants or not able to fectch');
                        NODICS.LOG.error(error);
                        resolve(true);
                    });
                });
            }).then(() => {
                SERVICE.DefaultInternalAuthenticationProviderService.scheduleInternalAuthTokenRefresh();
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Executes configured, layered, idempotent bootstrap reconcilers after init data is available.
     *
     * @returns {Promise<Array>} Reconciler results in configured order.
     * @sideEffects May create missing mandatory platform records through project-overridable services.
     */
    executeMandatoryBootstrapServices: function () {
        const serviceNames = this.getMandatoryBootstrapServiceNames();
        return serviceNames.reduce((promise, serviceName) => promise.then(results => {
            const service = SERVICE[serviceName];
            if (!service || typeof service.reconcile !== 'function') {
                throw new Error('Mandatory bootstrap service is not available: ' + serviceName);
            }
            return service.reconcile({
                tenant: CONFIG.get('defaultTenant') || 'default',
                modules: NODICS.getActiveModules(),
                source: 'startup'
            }).then(result => results.concat([result]));
        }), Promise.resolve([]));
    },

    /** Resolves enabled reconcilers from a merge-friendly ordered map with legacy array compatibility. */
    getMandatoryBootstrapServiceNames: function () {
        const configured = CONFIG.get('mandatoryBootstrapServices') || {};
        if (Array.isArray(configured)) return configured.filter(Boolean);
        return Object.keys(configured).map(key => Object.assign({ key: key }, configured[key] || {}))
            .filter(item => item.enabled !== false && item.service)
            .sort((left, right) => Number(left.order || 0) - Number(right.order || 0) || left.key.localeCompare(right.key))
            .map(item => item.service);
    },

    /** Starts the configured Nodics server after the framework lifecycle completes. */
    start: function () {
        let options = env.defaultOptions;
        this.initFramework(options).then(success => {
            SERVICE.DefaultRouterService.startServers().then(success => {
                if (CONFIG.get('activateNodePing')) {
                    SERVICE.DefaultNodeManagerService.notifyNodeStarted().then(success => {
                        SERVICE.DefaultNodeManagerService.checkActiveNodes();
                    }).catch(error => {
                        NODICS.LOG.error('Failed to notify nodes about current node:' + CONFIG.get('nodeId') + ' started');
                    });
                }
                NODICS.setEndTime(new Date());
                NODICS.setServerState('started');
                NODICS.LOG.info('Nodics started successfully in (', NODICS.getStartDuration(), ') ms \n');
                //this.initTestRuner();
            }).catch(error => {
                NODICS.LOG.error('Nodics server error : ', error);
            });
        }).catch(error => {
            console.error('Nodics server not started properly : ', error);
            process.exit(1);
        });
    },

    /** Runs the legacy application generator through the layered infrastructure service. */
    genApp: function (options) {
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateApp(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Runs the module-group generator using active default options. */
    genGroup: function () {
        let options = env.defaultOptions;
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateModuleGroup(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Runs the backend module generator using active default options. */
    genModule: function () {
        let options = env.defaultOptions;
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateModule(options);
        }).catch(error => {
            console.error(error);
        });
    },
    /** Runs the optional React-client module generator through the infrastructure extension point. */
    genReactModule: function () {
        let options = env.defaultOptions;
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateReactModule(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Runs the optional Vue-client module generator through the infrastructure extension point. */
    genVueModule: function () {
        let options = env.defaultOptions;
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateVueModule(options);
        }).catch(error => {
            console.error(error);
        });
    },

    /** Cleans generated artifacts for every active module through the standard clean lifecycle. */
    cleanAll: function () {
        let options = env.defaultOptions;
        config.prepareClean(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.cleanModules();
        }).catch(error => {
            console.error(error);
        });
    },

    /** Recreates generated framework artifacts from active layered source definitions. */
    buildAll: function () {
        let options = env.defaultOptions;
        config.prepareBuild(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultStatusService.loadStatusDefinitions();
                resolve(true);
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null));
                resolve(true);
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                SERVICE.DefaultDatabaseConnectionHandlerService.createDatabaseConnection(defaultTenant, true).then(success => {
                    SERVICE.DefaultDatabaseConnectionHandlerService.getRuntimeSchema().then(runtimeSchema => {
                        SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.mergeRuntimeSchemaFiles(
                            SERVICE.DefaultDatabaseConfigurationService.getRawSchema(),
                            runtimeSchema
                        ));
                        SERVICE.DefaultDatabaseConnectionHandlerService.closeConnection('default', defaultTenant);
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            });
        }).then(() => {
            return SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(SERVICE.DefaultDatabaseConfigurationService.getRawSchema());
        }).then(() => {
            return config.buildModules();
        }).catch(error => {
            console.error(error);
        });
    }
};
