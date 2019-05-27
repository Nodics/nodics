/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

const config = require('./nConfig');

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
                    if (!NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                        SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken('default').then(success => {
                            NODICS.addInternalAuthToken('default', success.authToken);
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

    start: function (options) {
        this.initFramework(options).then(success => {
            SERVICE.DefaultRouterService.startServers().then(success => {
                NODICS.setEndTime(new Date());
                NODICS.setServerState('started');
                NODICS.LOG.info('Nodics started successfully in (', NODICS.getStartDuration(), ') ms \n');
                // SERVICE.DefaultImportService.importLocalData({
                //     inputPath: {
                //         rootPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data',
                //         dataPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/data',
                //         headerPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/headers',
                //         successPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/success',
                //         errorPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/error'
                //     },
                //     outputPath: {
                //         //rootPath: '' //Optional value, if not available will be taken from running server
                //     }
                // }).then(success => {
                //     SERVICE.DefaultImportService.processImportData({
                //         tenant: 'default',
                //         inputPath: {
                //             rootPath: NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import',
                //             dataType: 'local',
                //             postFix: 'data'
                //         }
                //     }).then(success => {
                //         NODICS.LOG.info('Nodics Import Success');
                //     }).catch(error => {
                //         NODICS.LOG.error('Nodics Import error : ', error);
                //     });
                //     NODICS.LOG.info('Nodics Import Success');
                // }).catch(error => {
                //     NODICS.LOG.error('Nodics Import error : ', error);
                // });
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
            SERVICE.DefaultInfraService.LOG.error(error);
        });
    },

    genGroup: function (options) {
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateModuleGroup(options);
        }).catch(error => {
            SERVICE.DefaultInfraService.LOG.error(error);
        });
    },

    genModule: function (options) {
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateModule(options);
        }).catch(error => {
            SERVICE.DefaultInfraService.LOG.error(error);
        });
    },
    genReactModule: function (options) {
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateReactModule(options);
        }).catch(error => {
            SERVICE.DefaultInfraService.LOG.error(error);
        });
    },

    genVueModule: function (options) {
        config.start(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateVueModule(options);
        }).catch(error => {
            SERVICE.DefaultInfraService.LOG.error(error);
        });
    },

    cleanAll: function (options) {
        config.prepareClean(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.cleanModules();
        }).catch(error => {
            NODICS.LOG.error(error);
        });
    },

    buildAll: function (options) {
        config.prepareBuild(options).then(() => {
            return config.initUtilities(options);
        }).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema();
        }).then(() => {
            return config.buildModules();
        }).catch(error => {
            SERVICE.DefaultInfraService.LOG.error(error);
        });
    },
};