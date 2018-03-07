/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const NodeCache = require("node-cache");

module.exports = {

    addToken: function(moduleName, source, hash, value) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                let ttl = CONFIG.get('cache').authTokenTTL;
                if (source) {
                    ttl = 0;
                }
                if (!moduleObject.authCache) {
                    moduleObject.authCache = new NodeCache(CONFIG.get('cache').authToken);
                }

                moduleObject.authCache.set(hash, JSON.stringify(value), ttl);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    findToken: function(request) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(request.moduleName);
                if (moduleObject.authCache) {
                    let value = moduleObject.authCache.get(request.authToken);
                    if (value) {
                        resolve(JSON.parse(value));
                    } else {
                        reject('Invalid token');
                    }
                } else {
                    reject('Invalid token');
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
                    header: {
                        authToken: processRequest.authToken
                    }
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