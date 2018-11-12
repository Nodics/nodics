/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    addToken: function (moduleName, source, hash, value) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                if (moduleObject.authCache) {
                    let input = {
                        cache: moduleObject.authCache,
                        hashKey: hash,
                        value: value,
                        options: {
                            ttl: CONFIG.get('cache').authTokenTTL
                        }
                    };
                    if (source) {
                        input.options.ttl = 0;
                    }
                    SERVICE.DefaultCacheService.put(input);
                    resolve(true);
                } else {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00002'
                    });
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_AUTH_00000',
                    error: error
                });
            }
        });
    },

    findToken: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(request.moduleName);
                if (moduleObject.authCache) {
                    SERVICE.DefaultCacheService.get({
                        cache: moduleObject.authCache,
                        hashKey: request.authToken
                    }).then(value => {
                        resolve(value);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00001'
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    prepareURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'POST',
            apiName: '/authorize',
            requestBody: {},
            isJsonResponse: true,
            header: {
                authToken: input.authToken
            }
        });
    },

    authorizeToken: function (request, callback) {
        let input = request.local || request;
        this.findToken(input).then(success => {
            callback(null, success.result);
        }).catch(error => {
            if (input.moduleName !== CONFIG.get('profileModuleName')) {
                this.LOG.debug('Authorizing request for token :', input.authToken);
                SERVICE.DefaultModuleService.fetch(this.prepareURL(input), (error, response) => {
                    if (error) {
                        callback(error);
                    } else if (!response.success) {
                        callback('Given token is not valid one');
                    } else {
                        callback(null, response.result);
                    }
                });
            } else {
                this.reAuthenticate(input).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            }
        });
    }
};