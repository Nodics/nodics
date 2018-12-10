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
        return new Promise((resolve, reject) => {
            this.invalidateAuthToken({
                isEnterprise: true,
                enterpriseCode: enterprise.code
            }).then(success => {
                if (success.length > 0) {
                    let eventsData = [];
                    success.forEach(element => {
                        let value = NODICS.findAPIKey(element);
                        if (value) {
                            if (isRemoved) {
                                NODICS.removeAPIKey(enterprise.tenant.code);
                                eventsData.push(value);
                            } else {
                                value.enterpriseCode = enterprise.code;
                                value.tenant = enterprise.tenant.code;
                                NODICS.addAPIKey(enterprise.tenant.code, element, value);
                            }
                        }
                    });
                    if (isRemoved) {
                        _self.publishAPIKeyRemoveEvent(eventsData).then(success => {
                            _self.LOG.debug('Successfully updated API keys to all servers');
                        }).catch(error => {
                            _self.LOG.error('Failed updating API keys to all servers');
                            _self.LOG.error(error);
                        });
                    }
                }
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    invalidateEmployeeAuthToken: function (person, isRemoved) {
        let _self = this;
        this.invalidateAuthToken({
            enterpriseCode: person.enterpriseCode,
            tenant: person.tenant,
            loginId: person.loginId,
            type: 'Employee'
        }).then(success => {
            if (success.length > 0) {
                let eventsData = [];
                success.forEach(element => {
                    let oldValue = NODICS.findAPIKey(element);
                    if (oldValue) {
                        let newValue = {
                            enterpriseCode: person.enterpriseCode,
                            tenant: person.tenant,
                            loginId: person.loginId
                        };
                        newValue.key = person.apiKey;
                        if (isRemoved) {
                            NODICS.removeAPIKey(person.tenant);
                        } else {
                            NODICS.addAPIKey(person.tenant, person.apiKey, newValue);
                        }
                        eventsData.push(newValue);
                    }
                });
                if (isRemoved) {
                    _self.publishAPIKeyRemoveEvent(eventsData).then(success => {
                        _self.LOG.debug('Successfully updated API keys to all servers');
                    }).catch(error => {
                        _self.LOG.error('Failed updating API keys to all servers');
                        _self.LOG.error(error);
                    });
                } else {
                    _self.publishAPIKeyChangeEvent(eventsData).then(success => {
                        _self.LOG.debug('Successfully updated API keys to all servers');
                    }).catch(error => {
                        _self.LOG.error('Failed updating API keys to all servers');
                        _self.LOG.error(error);
                    });
                }
            }
            resolve(success);
        }).catch(error => {
            reject(error);
        });
    },

    invalidateCustomerAuthToken: function (person) {
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
    },

    invalidateAuthToken: function (options) {
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(CONFIG.get('profileModuleName'));
            if (moduleObject && moduleObject.authCache && moduleObject.authCache && moduleObject.authCache.tokens) {
                let authTokens = [];
                _.each(moduleObject.authCache.tokens, (authObj, authToken) => {
                    if (options.isEnterprise) {
                        if (authObj.enterpriseCode === options.enterpriseCode) {
                            authTokens.push(authToken);
                        }
                    } else {
                        if (authObj.enterpriseCode === options.enterpriseCode &&
                            authObj.tenant === options.tenant &&
                            authObj.loginId === options.loginId &&
                            authObj.type === options.type) {
                            authTokens.push(authToken);
                        }
                    }
                });
                if (authTokens.length > 0) {
                    SERVICE.DefaultCacheService.flushKeys(moduleObject.authCache, authTokens).then(success => {
                        resolve(authTokens);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve({
                        success: true,
                        code: '',
                        msg: 'None already invalidated invalidated'
                    });
                }
            } else {
                resolve({
                    success: true,
                    code: '',
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
                    events.push({
                        enterpriseCode: data.enterpriseCode,
                        tenant: 'default',
                        event: 'apiKeyUpdate',
                        source: 'profile',
                        target: 'profile',
                        excludeModules: ['profile'],
                        state: "NEW",
                        type: "SYNC",
                        targetType: ENUMS.TargetType.EACH_NODE.key,
                        data: {
                            tenantName: data.tenant,
                            apiKey: data.apiKey
                        }
                    });
                });
                if (events.length > 0) {
                    this.LOG.debug('Pushing event for enterprise updated');
                    SERVICE.DefaultEventService.publish(event).then(success => {
                        this.LOG.debug('Event successfully posted');
                    }).catch(error => {
                        this.LOG.error('While posting model change event : ', error);
                    });
                }
            }
            resolve(true);
        });
    },

    publishAPIKeyRemoveEvent: function (eventsData) {
        return new Promise((resolve, reject) => {
            if (eventsData && eventsData.length > 0) {
                let events = [];
                eventsData.forEach(data => {
                    events.push({
                        enterpriseCode: data.enterpriseCode,
                        tenant: 'default',
                        event: 'apiKeyRemove',
                        source: 'profile',
                        target: 'profile',
                        excludeModules: ['profile'],
                        state: "NEW",
                        type: "SYNC",
                        targetType: ENUMS.TargetType.EACH_NODE.key,
                        data: {
                            tenantName: data.tenant
                        }
                    });
                });
                if (events.length > 0) {
                    this.LOG.debug('Pushing event for enterprise updated');
                    SERVICE.DefaultEventService.publish(event).then(success => {
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