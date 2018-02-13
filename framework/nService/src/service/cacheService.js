/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const NodeCache = require("node-cache");

module.exports = {
    options: {
        isNew: true
    },

    initCache: function(moduleObject, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let cache = CONFIG.get('cache');
            let cacheConfig = _.merge(_.merge({}, cache.default || {}), cache[moduleName] || {});
            try {
                Promise.all([
                    _self.initApiCache(moduleObject, moduleName, cacheConfig),
                    _self.initItemCache(moduleObject, moduleName, cacheConfig)
                ]).then(success => {
                    resolve();
                }).catch(error => {
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    initApiCache: function(moduleObject, moduleName, cacheConfig) {
        return new Promise((resolve, reject) => {
            if (moduleObject.metaData.publish) {
                if (!moduleObject.apiCache &&
                    cacheConfig.apiCache.enabled) {
                    SERVICE[cacheConfig.apiCache.engine.toUpperCaseFirstChar() + 'CacheService']
                        .initApiCache(cacheConfig[cacheConfig.apiCache.engine + 'Options'], moduleName).then(value => {
                            moduleObject.apiCache = {
                                type: cacheConfig.apiCache.engine,
                                client: value
                            };
                            resolve();
                        }).catch(error => {
                            console.log('   ERROR: Not able to initialize API cache for :', moduleName, '  :  ', error);
                            if (cacheConfig.apiCache.engine !== 'local' && cacheConfig.apiCache.fallback) {
                                console.log('   INFO: Initializing local API cache');
                                cacheConfig.apiCache.engine = 'local';
                                SERVICE[cacheConfig.apiCache.engine.toUpperCaseFirstChar() + 'CacheService']
                                    .initApiCache(cacheConfig[cacheConfig.apiCache.engine + 'Options'], moduleName).then(value => {
                                        moduleObject.apiCache = {
                                            type: cacheConfig.apiCache.engine,
                                            client: value
                                        };
                                        resolve();
                                    }).catch(error => {
                                        resolve();
                                    });
                            } else {
                                resolve();
                            }
                        });
                } else {
                    console.log('   WARN: API Cache is not enabled for : ', moduleName);
                    resolve('   ERROR: API Cache is not enabled for : ' + moduleName);
                }
            } else {
                resolve();
            }
        });
    },

    initItemCache: function(moduleObject, moduleName, cacheConfig) {
        return new Promise((resolve, reject) => {
            if (moduleObject.rawSchema) {
                if (!moduleObject.itemCache &&
                    cacheConfig.itemCache.enabled) {
                    SERVICE[cacheConfig.itemCache.engine.toUpperCaseFirstChar() + 'CacheService']
                        .initItemCache(cacheConfig[cacheConfig.itemCache.engine + 'Options'], moduleName).then(value => {
                            moduleObject.itemCache = {
                                type: cacheConfig.itemCache.engine,
                                client: value
                            };
                            resolve();
                        }).catch(error => {
                            console.log('   ERROR: Not able to initialize Item cache for :', moduleName, '  :  ', error);
                            if (cacheConfig.itemCache.engine !== 'local' && cacheConfig.itemCache.fallback) {
                                console.log('   INFO: Initializing local Item cache');
                                cacheConfig.itemCache.engine = 'local';
                                SERVICE[cacheConfig.itemCache.engine.toUpperCaseFirstChar() + 'CacheService']
                                    .initApiCache(cacheConfig[cacheConfig.itemCache.engine + 'Options'], moduleName).then(value => {
                                        moduleObject.itemCache = {
                                            type: cacheConfig.itemCache.engine,
                                            client: value
                                        };
                                        resolve();
                                    }).catch(error => {
                                        resolve();
                                    });
                            } else {
                                resolve();
                            }
                        });
                } else {
                    console.log('   WARN: Item Cache is not enabled for : ', moduleName);
                    resolve('   ERROR: Item Cache is not enabled for : ' + moduleName);
                }
            } else {
                resolve();
            }
        });
    },

    flushApiCache: function(request, callback) {
        try {
            let moduleObject = NODICS.getModules()[request.moduleName];
            if (moduleObject.apiCache) {
                if (moduleObject.apiCache.type === 'local') {
                    moduleObject.apiCache.client.flushAll();
                    callback(null, 'api cache for module : ' + request.moduleName + ', flushed successfully');
                }
            }
        } catch (error) {
            callback(error);
        }
    },

    flushItemCache: function(request, callback) {
        try {
            let moduleObject = NODICS.getModules()[request.moduleName];
            if (moduleObject.itemCache) {
                if (moduleObject.itemCache.type === 'local') {
                    moduleObject.itemCache.client.flushAll();
                    callback(null, 'api cache for module : ' + request.moduleName + ', flushed successfully');
                }
            }
        } catch (error) {
            callback(error);
        }
    },

    get: function(cache, key) {
        let hash = SYSTEM.generateHash(key);
        try {
            console.log(' ------------------- ', cache.type);
            return SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].get(cache.client, hash);
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    },

    put: function(cache, key, value, options) {
        let hash = SYSTEM.generateHash(key);
        try {
            return SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].put(cache.client, hash, value, options);
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    },

    createApiKey: function(request) {
        let key = request.originalUrl;
        let method = request.method;

        if (method === 'POST' || method === 'post') {
            if (request.body) {
                key += '-' + JSON.stringify(request.body);
            }
        }
        if (request.get('authToken')) {
            key += '-' + request.get('authToken');
        }
        if (request.get('enterpriseCode')) {
            key += '-' + request.get('enterpriseCode');
        }
        return method + '-' + key;
    },
    getApi: function(cache, request, response) {
        let key = this.createApiKey(request);
        return this.get(cache, key);
    },
    putApi: function(cache, request, response, options) {
        let key = this.createApiKey(request);
        return this.put(cache, key, response, options);
    },
    getItem: function(rawSchema, cache, query) {
        let key = rawSchema.modelName + rawSchema.tenant + query;
        return this.get(cache, key);
    },
    putItem: function(rawSchema, cache, query, value) {
        let key = rawSchema.modelName + rawSchema.tenant + query;
        console.log(' Putting value in cache : ', cache.type);
        return this.put(cache, key, value, rawSchema.cache);
    }
};