/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const NodeCache = require("node-cache");

module.exports = {

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

    flushApiCache(request, callback) {
        let moduleObject = NODICS.getModules()[request.moduleName];
        if (moduleObject.apiCache) {
            return this.flush(moduleObject.apiCache, request.prefix, request.moduleName, callback);
        }
    },

    flushItemCache(request, callback) {
        let moduleObject = NODICS.getModules()[request.moduleName];
        if (moduleObject.itemCache) {
            return this.flush(moduleObject.itemCache, request.prefix, request.moduleName, callback);
        }
    },

    flush: function(cache, prefix, moduleName, callback) {
        SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].flush(cache.client, prefix).then(success => {
            console.log('   INFO: cache for module : ', moduleName, ', flushed successfully');
            if (callback) {
                callback(null, 'cache for module : ' + moduleName + ', flushed successfully');
            }
        }).catch(error => {
            console.log('   ERROR: While flushing cache for module : ', moduleName);
            if (callback) {
                callback(error);
            }
        });
    },

    flushApiCacheKeys: function(request, callback) {
        callback('Not supported for API cache');
    },

    flushItemCacheKeys: function(request, callback) {
        let moduleObject = NODICS.getModules()[request.moduleName];
        if (moduleObject.itemCache) {
            return this.flushKeys(moduleObject.itemCache, request.keys, request.moduleName, callback);
        }
    },

    flushKeys: function(cache, keys, moduleName, callback) {
        SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].flushKeys(cache.client, keys).then(success => {
            console.log('   INFO: cache for module : ' + moduleName + ', flushed successfully');
            if (callback) {
                callback(null, 'cache for module : ' + moduleName + ', flushed successfully');
            }
        }).catch(error => {
            console.log('   ERROR: While flushing cache for module : ', moduleName);
            if (callback) {
                callback(error);
            }
        });
    },

    get: function(cache, hash) {
        console.log('   INFO: Getting value for key : ', hash);
        try {
            return SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].get(cache.client, hash);
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    },

    put: function(cache, hash, value, options) {
        console.log('   INFO: Putting value for key : ', hash);
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

    createItemKey: function(input) {
        if (input._mongooseOptions) {
            let pageSize = input.options.limit || CONFIG.get('defaultPageSize');
            let pageNumber = 0;
            if (input.options.skip !== 0) {
                pageNumber = input.options.skip / pageSize;
            }
            let sort = input.options.sort || {};
            let select = input._fields || {};

            return {
                pageSize: pageSize,
                pageNumber: pageNumber,
                select: select || {},
                sort: sort || {},
                query: input.getQuery() || {}
            };
        } else {
            return {
                pageSize: input.options.pageSize || CONFIG.get('defaultPageSize'),
                pageNumber: input.options.pageNumber || CONFIG.get('defaultPageNumber'),
                select: input.options.select || {},
                sort: input.options.sort || {},
                query: input.options.query || {}
            };
        }
    },
    getApi: function(cache, request, response) {
        let hash = SYSTEM.generateHash(this.createApiKey(request));
        return this.get(cache, hash);
    },
    putApi: function(cache, request, response, options) {
        let hash = SYSTEM.generateHash(this.createApiKey(request));
        return this.put(cache, hash, response, options);
    },
    getItem: function(rawSchema, cache, query) {
        let hash = rawSchema.modelName + '_' +
            rawSchema.tenant + '_' +
            SYSTEM.generateHash(JSON.stringify(query));
        //console.log('Get Key :', rawSchema.modelName + '_' + rawSchema.tenant + '_' + JSON.stringify(query));
        return this.get(cache, hash);
    },
    putItem: function(rawSchema, cache, query, value) {
        let hash = rawSchema.modelName + '_' +
            rawSchema.tenant + '_' +
            SYSTEM.generateHash(JSON.stringify(query));
        //console.log('Put Key :', rawSchema.modelName + '_' + rawSchema.tenant + '_' + JSON.stringify(query));
        return this.put(cache, hash, value, rawSchema.cache);
    }
};