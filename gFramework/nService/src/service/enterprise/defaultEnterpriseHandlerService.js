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

    fetchEnterprise: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                    SERVICE.DefaultEnterpriseService.get({
                        tenant: 'default',
                        options: {
                            recursive: true,
                        },
                    }).then(success => {
                        if (success.success || success.result.length > 0) {
                            resolve(success.result);
                        } else {
                            _self.LOG.error('Could not found any active enterprises currently');
                            reject(new CLASSES.NodicsError('ERR_ENT_00001', 'Could not found any active enterprises currently'));
                        }
                    }).catch(error => {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_ENT_00001'));
                    });
                } else {
                    let requestUrl = SERVICE.DefaultModuleService.buildRequest({
                        moduleName: 'profile',
                        methodName: 'POST',
                        apiName: '/enterprise',
                        requestBody: {},
                        responseType: true,
                        header: {
                            authToken: NODICS.getInternalAuthToken('default'),
                            recursive: true
                        }
                    });
                    try {
                        SERVICE.DefaultModuleService.fetch(requestUrl).then(response => {
                            resolve(response.result || []);
                        }).catch(error => {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_ENT_00001'));
                        });
                    } catch (error) {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_ENT_00001'));
                    }
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_ENT_00001'));
            }
        });
    },

    buildEnterprises: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.fetchEnterprise().then(success => {
                    _self.buildEnterprise(success).then(success => {
                        resolve({
                            code: 'SUC_SYS_00000'
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                    if (error.code && error.code === 'ERR_DBS_00001') {
                        _self.LOG.error('While connecting tenant server to fetch all active tenants');
                        _self.LOG.error('Please check if PROFILE module is running and have proper PORT configured');
                        setTimeout(() => {
                            _self.handleEnterpriseLoadFailure();
                        }, CONFIG.get('profileModuleReconnectTimeout') || 2000);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    handleEnterpriseLoadFailure: function () {
        let _self = this;
        _self.fetchEnterprise().then(success => {
            _self.buildEnterprise(success).then(success => {
                _self.LOG.info('Active tenants loaded successfully');
            }).catch(error => {
                _self.LOG.error('Failed while building tenant enviroment', error);
            });
        }).catch(error => {
            if (error.code && error.code === 'ERR_DBS_00001') {
                _self.LOG.error('While connecting tenant server to fetch all active tenants');
                _self.LOG.error('Please check if PROFILE module is running and have proper PORT configured');
                setTimeout(() => {
                    _self.handleEnterpriseLoadFailure();
                }, CONFIG.get('profileModuleReconnectTimeout') || 2000);
            }
        });
    },

    buildEnterprise: function (enterprises) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (enterprises && enterprises.length > 0) {
                    let enterprise = enterprises.shift();
                    if (enterprise.active) {
                        NODICS.addActiveEnterprise(enterprise.code, enterprise.tenant.code);
                    } else {
                        NODICS.removeActiveEnterprise(enterprise.code);
                    }
                    if (enterprise.active && enterprise.tenant && enterprise.tenant.active && !NODICS.getActiveTenants().includes(enterprise.tenant.code)) {
                        NODICS.addActiveTenant(enterprise.tenant.code);
                        let tntConfig = _.merge({}, CONFIG.getProperties());
                        tntConfig = _.merge(tntConfig, enterprise.tenant.properties);
                        CONFIG.setProperties(tntConfig, enterprise.tenant.code);
                        SERVICE.DefaultDatabaseConnectionHandlerService.createDatabaseConnection(enterprise.tenant.code).then(success => {
                            SERVICE.DefaultDatabaseModelHandlerService.buildModelsForTenant(enterprise.tenant.code).then(success => {
                                if (SERVICE.DefaultSearchEngineConnectionHandlerService) {
                                    SERVICE.DefaultSearchEngineConnectionHandlerService.createTenantsSearchEngines([enterprise.tenant.code]).then(success => {
                                        SERVICE.DefaultSearchSchemaHandlerService.prepareSearchSchema([enterprise.tenant.code]);
                                        SERVICE.DefaultSearchModelHandlerService.prepareSearchModels(Object.keys(NODICS.getModules()), [enterprise.tenant.code]);
                                        SERVICE.DefaultSearchModelHandlerService.updateIndexesSchema();
                                        this.LOG.debug('Search connections has been established successfully');
                                    }).catch(error => {
                                        this.LOG.error('Failed establishing connections with search engine');
                                        this.LOG.error(error);
                                    });
                                }
                                if (SERVICE.DefaultCronJobService && CONFIG.get('cronjob') && CONFIG.get('cronjob').runOnStartup) {
                                    setInterval(function () {
                                        _self.LOG.info('Starting active jobs for tenant: ' + enterprise.tenant.code);
                                        SERVICE.DefaultCronJobService.createAllJobs([enterprise.tenant.code]).then(success => {
                                            _self.LOG.debug('Following job has been started');
                                            _self.LOG.debug(success);
                                        }).catch(error => {
                                            _self.LOG.error('Failed starting jobs for tenant: ' + enterprise.tenant.code);
                                            _self.LOG.error(error);
                                        });
                                    }, 3000);
                                }
                                if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                                    SERVICE.DefaultEmployeeService.get({
                                        tenant: enterprise.tenant.code,
                                        query: {
                                            code: 'apiAdmin'
                                        }
                                    }).then(success => {
                                        if (success.success && success.result.length <= 0) {
                                            SERVICE.DefaultImportService.importInitData({
                                                tenant: enterprise.tenant.code,
                                                modules: NODICS.getActiveModules()
                                            }).then(success => {
                                                SERVICE.DefaultEmployeeService.get({
                                                    tenant: enterprise.tenant.code,
                                                    query: {
                                                        code: 'apiAdmin'
                                                    }
                                                }).then(success => {
                                                    if (success.success && success.result.length > 0) {
                                                        let authToken = SERVICE.DefaultAuthenticationProviderService.generateAuthToken({
                                                            entCode: enterprise.code,
                                                            tenant: enterprise.tenant.code,
                                                            apiKey: success.result[0].apiKey,
                                                            lifetime: true
                                                        });
                                                        NODICS.addInternalAuthToken(enterprise.tenant.code, authToken);
                                                        _self.buildEnterprise(enterprises).then(success => {
                                                            resolve(true);
                                                        }).catch(error => {
                                                            reject(error);
                                                        });
                                                    } else {
                                                        reject(new CLASSES.NodicsError('ERR_SYS_00000', 'Could not load default API key for tenant: ' + enterprise.tenant.code));
                                                    }
                                                }).catch(error => {
                                                    reject(error);
                                                });
                                            }).catch(error => {
                                                NODICS.LOG.error('Initial data import failed');
                                                reject(error);
                                            });
                                        } else {
                                            let authToken = SERVICE.DefaultAuthenticationProviderService.generateAuthToken({
                                                entCode: enterprise.code,
                                                tenant: enterprise.tenant.code,
                                                apiKey: success.result[0].apiKey,
                                                lifetime: true
                                            });
                                            NODICS.addInternalAuthToken(enterprise.tenant.code, authToken);
                                            _self.buildEnterprise(enterprises).then(success => {
                                                resolve(true);
                                            }).catch(error => {
                                                reject(error);
                                            });
                                        }
                                    }).catch(error => {
                                        _self.LOG.error('Failed loading tenant: ' + enterprise.tenant.code);
                                        _self.LOG.error(error);
                                        reject(error);
                                    });
                                } else {
                                    SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(enterprise.tenant.code).then(success => {
                                        NODICS.addInternalAuthToken(enterprise.tenant.code, success.authToken);
                                        _self.buildEnterprise(enterprises).then(success => {
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
                    } else {
                        if (enterprise.code != 'default') {
                            _self.LOG.info('Enterprise: ' + enterprise.code + ' is not active or already running');
                        }
                        _self.buildEnterprise(enterprises).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
};