/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

const util = require('util');
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

    initFrameworkExecute: function (options) {
        return new Promise((resolve, reject) => {
            config.loadConfig(options);
            SYSTEM.executePreScripts();
            common.loadCommon();
            db.loadDatabase().then(success => {
                let allPromise = [
                    dao.loadDao(),
                    services.loadService(),
                    process.loadProcess(),
                    facades.loadFacade(),
                    controllers.loadController()
                ];
                if (allPromise.length > 0) {
                    Promise.all(allPromise).then(success => {
                        SYSTEM.loadModules();
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
                        SYSTEM.LOG.error('While generating default clesses : ', error);
                        reject(error);
                    });
                } else {
                    reject('Facing issues while loading services');
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    initTestRuner: function () {
        test.initTest().then(success => {}).catch(error => {});
    },

    startNodics: function (options) {
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