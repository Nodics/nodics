/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    addToken: function(moduleObject, cache, hash, value) {
        return new Promise((resolve, reject) => {
            try {
                if (cache) {
                    SERVICE.CacheService.put(cache, hash, JSON.stringify(value), CONFIG.get('authTokenLife')).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    if (!moduleObject.cache) {
                        moduleObject.cache = {};
                    }
                    moduleObject.cache[hash] = {
                        employee: employee,
                        enterprise: enterprise
                    };
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    findToken: function(request) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(request.moduleName);
                let cache = moduleObject.apiCache || moduleObject.itemCache;
                if (cache) {
                    SERVICE.CacheService.get(cache, request.authToken).then(value => {
                        resolve(JSON.parse(value));
                    }).catch(error => {
                        reject('Invalid token');
                    });
                } else {
                    if (moduleObject && moduleObject.cache && moduleObject.cache[request.authToken]) {
                        let result = moduleObject.cache[request.authToken];
                        if (result) {
                            resolve(JSON.parse(result));
                        } else {
                            reject('Invalid token');
                        }
                    } else {
                        reject('Invalid token');
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    authorizeToken: function(processRequest, callback) {
        this.findToken(processRequest).then(success => {
            callback(null, success);
        }).catch(error => {
            if (processRequest.moduleName !== CONFIG.get('authorizationModuleName')) {
                let options = {
                    moduleName: 'profile',
                    methodName: 'POST',
                    apiName: 'authorize',
                    requestBody: {},
                    isJsonResponse: true,
                    authToken: processRequest.authToken
                };
                let requestUrl = SERVICE.ModuleService.buildRequest(options);
                console.log('   INFO: Authorizing reqiuest for token :', processRequest.authToken);
                SERVICE.ModuleService.fetch(requestUrl, (error, response) => {
                    if (error) {
                        callback(error);
                    } else if (!response.success) {
                        callback('Given token is not valid one');
                    } else {
                        callback(null, response.result);
                    }
                });
            } else {
                callback('Given token is not valid one');
            }
        });
    }
};