/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    invalidateEnterpriseAuthToken: function (enterprise, isRemoved) {
        let _self = this;
        return new Promise((resolve, reject) => {
            this.invalidateAuthToken({
                isEnterprise: true,
                enterpriseCode: enterprise.code
            }).then(success => {
                _self.updateAPIKeys({
                    isRemoved: isRemoved,
                    isEnterprise: true,
                    enterpriseCode: enterprise.code,
                    tenant: enterprise.tenant.code,
                    enterprise: enterprise
                }).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    invalidateEmployeeAuthToken: function (person, isRemoved) {
        let _self = this;
        return new Promise((resolve, reject) => {
            this.invalidateAuthToken({
                enterpriseCode: person.enterpriseCode,
                tenant: person.tenant,
                loginId: person.loginId,
                type: 'Employee'
            }).then(success => {
                _self.updateAPIKeys({
                    isRemoved: isRemoved,
                    isEnterprise: false,
                    enterpriseCode: person.enterpriseCode,
                    tenant: person.tenant,
                    loginId: person.loginId,
                    apiKey: person.apiKey
                }).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    invalidateCustomerAuthToken: function (person) {
        return new Promise((resolve, reject) => {
            this.invalidateAuthToken({
                enterpriseCode: person.enterpriseCode,
                tenant: person.tenant,
                loginId: person.loginId,
                type: 'Customer'
            }).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    updateAPIKeys: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let apiKeys = NODICS.getAPIKeys();
                if (Object.keys(apiKeys).length > 0) {
                    let matchKeys = [];
                    _.each(apiKeys, (kayObject, tenant) => {
                        let oldValue = _.merge({}, kayObject);
                        if (options.isEnterprise && kayObject.enterpriseCode === options.enterpriseCode && kayObject.tenant === options.tenant) {
                            if (options.isRemoved || !options.enterprise.active || !options.enterprise.tenant.active) {
                                oldValue.operation = 'removed';
                                NODICS.removeAPIKey(options.tenant);
                                matchKeys.push(oldValue);
                            } else {
                                kayObject.enterpriseCode = options.enterpriseCode;
                                kayObject.tenant = options.tenant;
                                NODICS.addAPIKey(options.tenant, kayObject.key, kayObject);
                                // No need to update this API key to other modules
                            }
                        } else if (kayObject.enterpriseCode === options.enterpriseCode &&
                            kayObject.tenant === options.tenant &&
                            kayObject.loginId === options.loginId) {
                            oldValue.newKey = options.apiKey;
                            if (options.isRemoved) {
                                oldValue.operation = 'removed';
                                NODICS.removeAPIKey(options.tenant);
                            } else {
                                oldValue.operation = 'updated';
                                kayObject.key = options.apiKey;
                                NODICS.addAPIKey(options.tenant, options.apiKey, kayObject);
                            }
                            matchKeys.push(oldValue);
                        }
                    });
                    if (matchKeys.length > 0) {
                        _self.publishAPIKeyChangeEvent(matchKeys).then(success => {
                            _self.LOG.debug('Successfully updated API keys to all servers');
                            resolve(true);
                        }).catch(error => {
                            _self.LOG.error('Failed updating API keys to all servers');
                            _self.LOG.error(error);
                            reject(error);
                        });
                    } else {
                        resolve({
                            success: true,
                            code: 'SUC_SYS_00000',
                            msg: 'None apiKeys found to update or remove'
                        });
                    }
                } else {
                    resolve({
                        success: true,
                        code: 'SUC_SYS_00000',
                        msg: 'None apiKeys found to update or remove'
                    });
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SYS_00000',
                    msg: error.toString()
                });
            }
        });
    },

    invalidateAuthToken: function (options) {
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(CONFIG.get('profileModuleName'));
            if (moduleObject && moduleObject.authCache && moduleObject.authCache.tokens) {
                let authTokens = [];
                _.each(moduleObject.authCache.tokens, (authObj, authToken) => {
                    if (options.isEnterprise) {
                        if (authObj.enterpriseCode === options.enterpriseCode) {
                            authTokens.push(authToken);
                            delete moduleObject.authCache.tokens[authToken];
                        }
                    } else {
                        if (authObj.enterpriseCode === options.enterpriseCode &&
                            authObj.tenant === options.tenant &&
                            authObj.loginId === options.loginId &&
                            authObj.type === options.type) {
                            authTokens.push(authToken);
                            delete moduleObject.authCache.tokens[authToken];
                        }
                    }
                });
                if (authTokens.length > 0) {
                    SERVICE.DefaultCacheService.flushCacheKeys({
                        moduleName: CONFIG.get('profileModuleName'),
                        channelName: 'auth',
                        keys: authTokens
                    }).then(success => {
                        resolve(authTokens);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve({
                        success: true,
                        code: 'SUC_SYS_00000',
                        msg: 'None already invalidated invalidated'
                    });
                }
            } else {
                resolve({
                    success: true,
                    code: 'SUC_SYS_00000',
                    msg: 'None already invalidated invalidated'
                });
            }
        });
    },

    publishAPIKeyChangeEvent: function (eventsData) {
        return new Promise((resolve, reject) => {
            if (eventsData && eventsData.length > 0) {
                let events = [];
                eventsData.forEach(data => {
                    let eventData = {
                        enterpriseCode: data.enterpriseCode,
                        tenant: 'default',
                        source: 'profile',
                        target: 'profile',
                        excludeModules: ['profile'],
                        state: "NEW",
                        type: "SYNC",
                        active: true,
                        targetType: ENUMS.TargetType.EACH_NODE.key,
                        data: {
                            tenant: data.tenant,
                            oldKey: data.key,
                            apiKey: data.newKey
                        }
                    };
                    if (data.operation && data.operation === 'removed') {
                        eventData.event = 'apiKeyRemove';
                    } else {
                        eventData.event = 'apiKeyUpdate';
                    }
                    events.push(eventData);
                });
                if (events.length > 0) {
                    this.LOG.debug('Pushing event for enterprise updated');
                    SERVICE.DefaultEventService.publish(events).then(success => {
                        this.LOG.debug('Event successfully posted');
                    }).catch(error => {
                        this.LOG.error('While posting model change event : ', error);
                    });
                }
            }
            resolve(true);
        });
    }
};