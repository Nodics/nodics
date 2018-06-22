/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

//const _ = require('lodash');
const config = require('./nConfig');
const common = require('./nCommon');
const db = require('./nDatabase');
const dao = require('./nDao');
const services = require('./nService');
const process = require('./nProcess');
const event = require('./nEvent');
const facades = require('./nFacade');
const controllers = require('./nController');
const router = require('./nRouter');
const test = require('./nTest');

module.exports = {
    init: function () {
        ////
    },

    cleanAll: function (options) {
        config.cleanAll(options);
        common.cleanAll();
    },

    genApp: function () {

    },

    genGroup: function () {

    },

    genModule: function () {

    },

    genModuleReact: function () {

    },

    genModuleVue: function () {

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

    initFrameworkExecute: function (options) {
        return new Promise((resolve, reject) => {
            config.start(options);
            SYSTEM.executePreScripts();
            common.start();
            db.loadDatabase().then(success => {
                SYSTEM.loadModules();
                process.loadProcess().then(success => {
                    SYSTEM.prepareModulesConfiguration();
                    event.loadListeners();
                    router.loadRouter().then(success => {
                        SYSTEM.executePostScripts();
                        if (NODICS.isInitRequired()) {
                            SERVICE.DataImportService.importInitData().then(success => {
                                SYSTEM.addTenants().then(success => {
                                    SYSTEM.loadTenantDatabase().then(success => {
                                        resolve(true);
                                    }).catch(error => {
                                        reject(error);
                                    });
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            SYSTEM.addTenants().then(success => {
                                SYSTEM.loadTenantDatabase().then(success => {
                                    resolve(true);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
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
        });
    },

    initTestRuner: function () {
        test.initTest().then(success => { }).catch(error => { });
    },

    start: function (options) {
        this.initFrameworkExecute(options).then(success => {
            SYSTEM.startServers().then(success => {
                SERVICE.BackgroundAuthTokenGenerateService.generateAuthToken(CONFIG.get('backgroundAuthModules')).then(success => {
                    NODICS.setEndTime(new Date());
                    NODICS.setServerState('started');
                    SYSTEM.LOG.info('Nodics started successfully in (', NODICS.getStartDuration(), ') ms \n');
                    this.initTestRuner();
                }).catch(error => {
                    SYSTEM.LOG.error('Failed to allocate default token with modules, check configuration : ', error);
                });
            }).catch(error => {
                SYSTEM.LOG.error('Nodics server error : ', error);
            });
        }).catch(error => {
            SYSTEM.LOG.error('Nodics server not started properly : ', error);
        });
    }
};