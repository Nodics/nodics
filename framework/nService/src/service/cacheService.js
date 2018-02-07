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
                                type: cacheConfig.itemCache.engine,
                                client: value
                            };
                            resolve();
                        }).catch(error => {
                            console.log('   ERROR: Not able to initialize API cache for :', moduleName, '  :  ', error);
                            resolve();
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
                            resolve();
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

    /*initItemCache: function(moduleObject, moduleName, cacheConfig) {
        return new Promise((resolve, reject) => {
            if (moduleObject.rawSchema) {
                if (!moduleObject.itemCache &&
                    cacheConfig.itemCache.enabled) {
                    if (cacheConfig.itemCache.engine === 'local') {
                        console.log('   INFO: Initializing local Item Cache instance for module: ', moduleName);
                        moduleObject.itemCache = {
                            type: cacheConfig.itemCache.engine,
                            client: new NodeCache(cacheConfig.localOptions)
                        };
                        resolve();
                    } else {

                    }
                } else {
                    console.log('   WARN: Item Cache is not enabled for : ', moduleName);
                    resolve('   ERROR: Item Cache is not enabled for : ' + moduleName);
                }
            } else {
                resolve();
            }
        });
    },*/

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
        return new Promise((resolve, reject) => {
            let hash = SYSTEM.generateHash(key);
            console.log('   INFO: Retrieving value from cache with key : ', hash);
            if (cache.type === 'local') {
                cache.client.get(hash, (error, success) => {
                    if (error) {
                        reject(error);
                    } else if (success) {
                        resolve(success);
                    } else {
                        reject('key not found');
                    }
                });
            } else {
                reject('Invalid client configuration');
            }
        });
    },

    put: function(cache, key, value, options) {
        return new Promise((resolve, reject) => {
            let hash = SYSTEM.generateHash(key);
            console.log('   INFO: Storing value from cache with key : ', hash);
            if (cache.type === 'local') {
                if (options.ttl) {
                    cache.client.set(hash, value, options.ttl);
                } else {
                    cache.client.set(hash, value);
                }
                resolve(true);
            } else {
                reject('Invalid client configuration');
            }
        });
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
        let options = {
            ttl: rawSchema.ttl
        };
        return this.put(cache, key, value, options);
    }
};