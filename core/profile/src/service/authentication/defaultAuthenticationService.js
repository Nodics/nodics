/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    invalidateEnterpriseAuthToken: function (enterpriseCode) {
        return new Promise((resolve, reject) => {
            this.invalidateAuthToken('enterpriseCode', enterpriseCode).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    invalidateEmployeeAuthToken: function (loginId) {
        this.invalidateAuthToken('loginId', loginId).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
        });
    },

    invalidateCustomerAuthToken: function (loginId) {
        this.invalidateAuthToken('loginId', loginId).then(success => {
            resolve(success);
        }).catch(error => {
            reject(error);
        });
    },

    invalidateAuthToken: function (propertyName, value) {
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(CONFIG.get('profileModuleName'));
            if (moduleObject && moduleObject.authCache && moduleObject.authCache && moduleObject.authCache.tokens) {
                let authTokens = [];
                _.each(moduleObject.authCache.tokens, (authObj, authToken) => {
                    if (authObj && authObj[propertyName] && authObj[propertyName] === value) {
                        authTokens.push(authToken);
                    }
                });
                if (authTokens.length > 0) {
                    SERVICE.DefaultCacheService.flushKeys(moduleObject.authCache, authTokens).then(success => {
                        resolve(success);
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

    invalidateAPIkey: function (propertyName, value) {
        return new Promise((resolve, reject) => {
            let moduleObject = NODICS.getModule(CONFIG.get('profileModuleName'));
            if (moduleObject && moduleObject.authCache && moduleObject.authCache && moduleObject.authCache.apiKeys) {
                let apiKeys = [];
                _.each(moduleObject.authCache.apiKeys, (authObj, authToken) => {
                    if (authObj && authObj[propertyName] && authObj[propertyName] === value) {
                        apiKeys.push(authToken);
                    }
                });
                if (apiKeys.length > 0) {
                    SERVICE.DefaultCacheService.flushKeys(moduleObject.authCache, apiKeys).then(success => {
                        resolve(success);
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
    }
};