/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const NodeCache = require("node-cache");

module.exports = {
    invalidateAuthToken: function (event, callback) {
        let moduleObject = NODICS.getModule(event.target);
        if (moduleObject.authCache && moduleObject.authCache.get(event.params[0].key)) {
            moduleObject.authCache.del(event.params[0].key, function (err, count) {
                if (err) {
                    this.LOG.error('While invalidating cache key : ', err);
                    callback(err);
                } else {
                    callback(null, 'Successfully deleted key from module : ' + event.target);
                }
            });
        } else {
            callback(null, 'Key is not there : ' + event.target);
        }
    },

    addToken: function (moduleName, source, hash, value) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                let ttl = CONFIG.get('cache').authTokenTTL;
                if (source) {
                    ttl = 0;
                }
                if (!moduleObject.authCache) {
                    moduleObject.authCache = new NodeCache(CONFIG.get('cache').authToken);
                    if (moduleName === CONFIG.get('profileModuleName')) {
                        moduleObject.authCache.on("expired", function (key, value) {
                            value = JSON.parse(value);
                            let event = {
                                enterpriseCode: value.enterprise.enterpriseCode,
                                event: 'invalidateAuthToken',
                                source: moduleName,
                                target: moduleName,
                                state: 'NEW',
                                type: 'SYNC',
                                targetType: 'EACH_NODE',
                                params: [{
                                    key: key
                                }]
                            };
                            _self.LOG.debug('Pushing event for expired cache key : ', key);
                            SERVICE.DefaultEventService.publish(event, (error, response) => {
                                if (error) {
                                    _self.LOG.error('While posting cache invalidation event : ', error);
                                } else {
                                    _self.LOG.debug('Event successfully posted : ');
                                }
                            });
                        });
                    }
                }
                moduleObject.authCache.set(hash, JSON.stringify(value), ttl);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    findToken: function (request) {
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

    prepareURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: 'profile',
            methodName: 'POST',
            apiName: 'authorize',
            requestBody: {},
            isJsonResponse: true,
            header: {
                authToken: input.authToken
            }
        });
    },

    authorizeToken: function (request, callback) {
        let _self = this;
        let input = request.local || request;
        this.findToken(input).then(success => {
            callback(null, success);
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
                        if (CONFIG.get('cache').makeAuthTokenLocal) {
                            _self.addToken(input.moduleName, null, input.authToken, response.result).then(success => {
                                _self.LOG.debug('Token stored locally for module : ' + input.moduleName);
                            }).catch(error => {
                                _self.LOG.error('While storing token locally for module : ' + input.moduleName);
                                _self.LOG.error(error);
                            });
                        }
                    }
                });
            } else {
                callback('Given token is not valid one');
            }
        });
    }
};