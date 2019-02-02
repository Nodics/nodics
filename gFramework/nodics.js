/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

const config = require('./nConfig');
const common = require('./nCommon');
const db = require('./nDatabase');
const dao = require('./nDao');
const services = require('./nService');
const pipeline = require('./nPipeline');
const event = require('./nEvent');
const facades = require('./nFacade');
const controllers = require('./nController');
const router = require('./nRouter');
const test = require('./nTest');

module.exports = {
    initFramework: function (options) {
        return new Promise((resolve, reject) => {
            config.start(options);
            config.initUtilities(options).then(() => {
                return config.loadModules();
            }).then(() => {
                return config.initEntities();
            }).then(() => {
                return config.finalizeEntities();
            }).then(() => {
                return config.finalizeModules();
            }).then(() => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },

    start: function (options) {
        this.initFramework(options).then(success => {
            /*SYSTEM.finalizeEntities().then(success => {
                SYSTEM.finalizeModules().then(success => {
                    SYSTEM.startServers().then(success => {
                        NODICS.setEndTime(new Date());
                        NODICS.setServerState('started');
                        SYSTEM.LOG.info('Nodics started successfully in (', NODICS.getStartDuration(), ') ms \n');
                        this.initTestRuner();
                    }).catch(error => {
                        SYSTEM.LOG.error('Nodics server error : ', error);
                    });
                }).catch(error => {
                    SYSTEM.LOG.error('Failed while running postInit functions from all modules : ', error);
                });
            }).catch(error => {
                SYSTEM.LOG.error('Failed while running postInit functions from all entities : ', error);
            });*/
            console.log('Nodics started successfully in (', NODICS.getStartDuration(), ') ms \n');
            //SYSTEM.LOG.info('Nodics started successfully in (', NODICS.getStartDuration(), ') ms \n');
        }).catch(error => {
            console.error('Nodics server not started properly : ', error);
            process.exit(1);
        });
    },

    genApp: function (options) {
        config.start(options);
        common.generateModuleGroup();
    },

    genGroup: function (options) {
        config.start(options);
        common.generateModuleGroup();
    },

    genModule: function (options) {
        config.start(options);
        config.initUtilities(options).then(() => {
            return config.loadModules();
        }).then(() => {
            return SERVICE.DefaultInfraService.generateModule(options);
        }).catch(error => {
            SERVICE.DefaultInfraService.LOG.error(error);
        });
    },

    /*cleanAll: function (options) {
        config.cleanAll(options);
        common.cleanAll();
    },

    

    genReactModule: function (options) {
        config.common(options);
        common.generateReactModule(options);
    },

    genVueModule: function (options) {
        config.common(options);
        common.generateVueModule(options);
    },

    buildAll: function (options) {
        config.buildAll(options);
        SYSTEM.executePreScripts();
        common.buildAll();
        db.loadOnlySchema().then(success => {
            let allPromise = [
                dao.genDao(),
                services.genService(),
                facades.genFacade(),
                controllers.genController()
            ];
            if (allPromise.length > 0) {
                Promise.all(allPromise).then(success => {
                    router.buildAll();
                }).catch(error => {
                    SYSTEM.LOG.error('While generating classes : ', error);
                });
            }
        });
    },

    initFramework: function (options) {
        return new Promise((resolve, reject) => {
            config.start(options);
            consif.initModules(options).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
            //SYSTEM.executePreScripts();
            //common.start();

            /*db.loadDatabase().then(success => {
                SYSTEM.loadModules().then(success => {
                    SYSTEM.initEntities().then(success => {
                        pipeline.loadPipelines().then(success => {
                            SYSTEM.prepareModulesConfiguration();
                            event.loadListeners();
                            router.loadRouter().then(success => {
                                SYSTEM.executePostScripts();
                                //NODICS.isInitRequired()
                                if (NODICS.isInitRequired()) {
                                    SERVICE.DefaultImportService.importInitData({
                                        tenant: 'default',
                                        modules: NODICS.getActiveModules()
                                    }).then(success => {
                                        SYSTEM.buildEnterprises().then(success => {
                                            resolve(true);
                                        }).catch(error => {
                                            SYSTEM.LOG.error('Not able to load tenants : ', error);
                                            resolve(true);
                                        });
                                    }).catch(error => {
                                        SYSTEM.LOG.error('Initial data import fails: ', error);
                                        reject(error);
                                    });
                                } else {
                                    SYSTEM.buildEnterprises().then(success => {
                                        resolve(true);
                                    }).catch(error => {
                                        SYSTEM.LOG.error('Not able to load tenants : ', error);
                                        resolve(true);
                                    });
                                }
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    initTestRuner: function () {
        test.initTest().then(success => { }).catch(error => { });
    },

    */
};