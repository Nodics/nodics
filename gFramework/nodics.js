/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const config = require('./nConfig');
const env = require('../env');
const util = require('util');

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
                        SERVICE.DefaultImportService.importInitData({
                            tenant: 'default',
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
                    if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                        let defaultAuthDetail = CONFIG.get('defaultAuthDetail') || {};
                        SERVICE.DefaultEmployeeService.findByAPIKey({
                            tenant: defaultAuthDetail.tenant,
                            apiKey: CONFIG.get('defaultAuthDetail').apiKey
                        }).then(employee => {
                            NODICS.addInternalAuthToken('default', SERVICE.DefaultAuthenticationProviderService.generateAuthToken({
                                entCode: defaultAuthDetail.entCode,
                                tenant: defaultAuthDetail.tenant,
                                apiKey: employee.apiKey,
                                userGroups: employee.userGroupCodes,
                                lifetime: true
                            }));
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken('default').then(success => {
                            NODICS.addInternalAuthToken('default', success.authToken);
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
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

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
                SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/schemas.js', null));
                resolve(true);
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                SERVICE.DefaultDatabaseConnectionHandlerService.createDatabaseConnection('default', true).then(success => {
                    SERVICE.DefaultDatabaseConnectionHandlerService.getRuntimeSchema().then(runtimeSchema => {
                        SERVICE.DefaultDatabaseConfigurationService.setRawSchema(_.merge(
                            SERVICE.DefaultDatabaseConfigurationService.getRawSchema(),
                            runtimeSchema
                        ));
                        SERVICE.DefaultDatabaseConnectionHandlerService.closeConnection('default', 'default');
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
            console.log(util.inspect(SERVICE.DefaultDatabaseConfigurationService.getRawSchema(), showHidden = false, depth = 7, colorize = true));
            return config.buildModules();
        }).catch(error => {
            console.error(error);
        });
    }
};