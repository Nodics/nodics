/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    fetchEnterprise: function () {
        return new Promise((resolve, reject) => {
            if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                SERVICE.DefaultEnterpriseService.get({
                    tenant: 'default',
                    options: {
                        recursive: true
                    }
                }).then(success => {
                    if (success.success || success.result.length > 0) {
                        resolve(success.result);
                    } else {
                        SYSTEM.LOG.error('Could not found any active enterprises currently');
                        reject({
                            success: false,
                            code: 'ERR_DBS_00000',
                            error: error
                        });
                    }
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_DBS_00000',
                        error: error
                    });
                });
            } else {
                let requestUrl = SERVICE.DefaultModuleService.buildRequest({
                    moduleName: 'profile',
                    methodName: 'POST',
                    apiName: '/enterprise',
                    requestBody: {},
                    isJsonResponse: true,
                    header: {
                        apiKey: NODICS.getAPIKey('default').key,
                        recursive: true
                    }
                });
                try {
                    SERVICE.DefaultModuleService.fetch(requestUrl, (error, response) => {
                        if (error) {
                            reject({
                                success: false,
                                code: 'ERR_DBS_00001',
                                error: error
                            });
                        } else {
                            resolve(response.result || []);
                        }
                    });
                } catch (error) {
                    reject({
                        success: false,
                        code: 'ERR_DBS_00000',
                        error: error
                    });
                }
            }
        });
    },

    fetchAPIKey: function (tntCode) {
        return new Promise((resolve, reject) => {
            let requestUrl = SERVICE.DefaultModuleService.buildRequest({
                moduleName: 'profile',
                methodName: 'GET',
                apiName: '/apikey/' + tntCode,
                requestBody: {},
                isJsonResponse: true,
                header: {
                    apiKey: NODICS.getAPIKey('default').key
                }
            });
            try {
                SERVICE.DefaultModuleService.fetch(requestUrl, (error, response) => {
                    if (error) {
                        SYSTEM.LOG.error('While connecting profile server to fetch API Key', error);
                        resolve([]);
                    } else {
                        resolve(response.result || []);
                    }
                });
            } catch (error) {
                SYSTEM.LOG.error('While connecting profile server to fetch API Key', error);
                resolve([]);
            }
        });
    },

    buildEnterprises: function () {
        return new Promise((resolve, reject) => {
            SYSTEM.fetchEnterprise().then(success => {
                SYSTEM.buildEnterprise(success).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SYS_00000'
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
                if (error.code && error.code === 'ERR_DBS_00001') {
                    SYSTEM.LOG.error('While connecting tenant server to fetch all active tenants');
                    SYSTEM.LOG.error('Please check if PROFILE module is running and have proper PORT configured');
                    setTimeout(() => {
                        SYSTEM.handleEnterpriseLoadFailure();
                    }, CONFIG.get('profileModuleReconnectTimeout') || 2000);
                }
            });
        });
    },

    handleEnterpriseLoadFailure: function () {
        SYSTEM.fetchEnterprise().then(success => {
            SYSTEM.buildEnterprise(success).then(success => {
                SYSTEM.LOG.info('Active tenants loaded successfully');
            }).catch(error => {
                SYSTEM.LOG.error('Failed while building tenant enviroment', error);
            });
        }).catch(error => {
            if (error.code && error.code === 'ERR_DBS_00001') {
                SYSTEM.LOG.error('While connecting tenant server to fetch all active tenants');
                SYSTEM.LOG.error('Please check if PROFILE module is running and have proper PORT configured');
                setTimeout(() => {
                    SYSTEM.handleEnterpriseLoadFailure();
                }, CONFIG.get('profileModuleReconnectTimeout') || 2000);
            }
        });
    },

    buildEnterprise: function (enterprises) {
        return new Promise((resolve, reject) => {
            if (enterprises && enterprises.length > 0) {
                let enterprise = enterprises.shift();
                if (enterprise.active && enterprise.tenant && enterprise.tenant.active && !NODICS.getTenants().includes(enterprise.tenant.code)) {
                    NODICS.addTenant(enterprise.tenant.code);
                    let tntConfig = _.merge({}, CONFIG.getProperties());
                    tntConfig = _.merge(tntConfig, enterprise.tenant.properties);
                    CONFIG.setProperties(tntConfig, enterprise.tenant.code);
                    SYSTEM.createTenantSearchEngines([enterprise.tenant.code]).then(success => {
                        this.LOG.debug('Search connections has been established successfully');
                    }).catch(error => {
                        this.LOG.error('Failed establishing connections with search engine');
                        this.LOG.error(error);
                    });
                    SYSTEM.createTenantDatabase(enterprise.tenant.code).then(success => {
                        SYSTEM.buildModelsForTenant(enterprise.tenant.code).then(success => {
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
                                                    let apiKeyValue = {
                                                        enterpriseCode: enterprise.code,
                                                        tenant: enterprise.tenant.code,
                                                        loginId: success.result[0].loginId
                                                    };
                                                    NODICS.addAPIKey(enterprise.tenant.code, success.result[0].apiKey, apiKeyValue);
                                                    SYSTEM.buildEnterprise(enterprises).then(success => {
                                                        resolve(true);
                                                    }).catch(error => {
                                                        reject(error);
                                                    });
                                                } else {
                                                    reject('Could not load default API key for tenant: ' + enterprise.tenant.code);
                                                }
                                            }).catch(error => {
                                                reject(error);
                                            });
                                        }).catch(error => {
                                            reject(error);
                                        });
                                    } else {
                                        let apiKeyValue = {
                                            enterpriseCode: enterprise.code,
                                            tenant: enterprise.tenant.code,
                                            loginId: success.result[0].loginId
                                        };
                                        NODICS.addAPIKey(enterprise.tenant.code, success.result[0].apiKey, apiKeyValue);
                                        SYSTEM.buildEnterprise(enterprises).then(success => {
                                            resolve(true);
                                        }).catch(error => {
                                            reject(error);
                                        });
                                    }
                                }).catch(error => {
                                    SYSTEM.LOG.error('Failed loading tenant: ' + enterprise.tenant.code);
                                    SYSTEM.LOG.error(error);
                                    reject(error);
                                });
                            } else {
                                SYSTEM.fetchAPIKey(enterprise.tenant.code).then(success => {
                                    NODICS.addAPIKey(enterprise.tenant.code, success.result, {});
                                    SYSTEM.buildEnterprise(enterprises).then(success => {
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
                    SYSTEM.buildEnterprise(enterprises).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },

    removeTenants: function (tenants) {
        return new Promise((resolve, reject) => {
            if (tenants && tenants.length > 0) {
                tenants.forEach(tenant => {
                    NODICS.removeTenant(tenant);
                    _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                        NODICS.removeTenantSearchEngine(moduleName, tenant);
                        NODICS.removeTenantRawSearchSchema(moduleName, tenant);
                        SYSTEM.removeTenantDatabase(moduleName, tenant).then(success => {
                            SYSTEM.LOG.debug('Successfully removed database connections for tenant: ' + tenant);
                            SYSTEM.removeModelsForTenant(moduleName, tenant).then(success => {
                                SYSTEM.LOG.debug('Successfully removed models for tenant: ' + tenant);
                                resolve({
                                    success: true,
                                    code: 'SUC_SYS_00000',
                                    msg: 'Tenant successfully deactivated'
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    });
                });
            }
        });
    }
};