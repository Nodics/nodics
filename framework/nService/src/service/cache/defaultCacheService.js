/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    changeApiCacheConfiguration: function (request, callback) {
        let input = request.local || request;
        callback('not implemented yet, comming soon');
    },

    changeItemCacheConfiguration: function (request, callback) {
        try {
            let input = request.local || request;
            let cacheConfig = CONFIG.get('cache').itemLevelCache;
            cacheConfig[input.config.schemaName] = _.merge(cacheConfig[input.config.schemaName], input.config.cache || {});
            callback(null, 'Cache has been updated successfully');
        } catch (error) {
            callback('Facing issue while updating item cache : ' + error.toString());
        }
    },


    initCache: function (moduleObject, moduleName) {
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

    initApiCache: function (moduleObject, moduleName, cacheConfig) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (moduleObject.metaData && moduleObject.metaData.publish) {
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
                            _self.LOG.debug('Not able to initialize API cache for :', moduleName, '  :  ', error);
                            if (cacheConfig.apiCache.engine !== 'local' && cacheConfig.apiCache.fallback) {
                                _self.LOG.debug('Initializing local API cache');
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
                    _self.LOG.warn('API Cache is not enabled for : ', moduleName);
                    resolve('API Cache is not enabled for : ' + moduleName);
                }
            } else {
                resolve();
            }
        });
    },

    initItemCache: function (moduleObject, moduleName, cacheConfig) {
        let _self = this;
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
                            _self.LOG.error('Not able to initialize Item cache for :', moduleName, '  :  ', error);
                            if (cacheConfig.itemCache.engine !== 'local' && cacheConfig.itemCache.fallback) {
                                _self.LOG.debug('Initializing local Item cache');
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
                    _self.LOG.warn('Item Cache is not enabled for : ', moduleName);
                    resolve('Item Cache is not enabled for : ' + moduleName);
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

    flush: function (cache, prefix, moduleName, callback) {
        SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].flush(cache.client, prefix).then(success => {
            this.LOG.debug('Cache for module : ', moduleName, ', flushed successfully');
            if (callback) {
                callback(null, 'cache for module : ' + moduleName + ', flushed successfully');
            }
        }).catch(error => {
            this.LOG.error('2While flushing cache for module : ', moduleName);
            this.LOG.error(error);
            if (callback) {
                callback(error);
            }
        });
    },

    flushApiCacheKeys: function (request, callback) {
        callback('Not supported for API cache');
    },

    flushItemCacheKeys: function (request, callback) {
        let moduleObject = NODICS.getModules()[request.moduleName];
        if (moduleObject.itemCache) {
            return this.flushKeys(moduleObject.itemCache, request.keys, request.moduleName, callback);
        }
    },

    flushKeys: function (cache, keys, moduleName, callback) {
        let _self = this;
        SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].flushKeys(cache.client, keys).then(success => {
            _self.LOG.debug('Cache for module : ' + moduleName + ', flushed successfully');
            if (callback) {
                callback(null, 'Cache for module : ' + moduleName + ', flushed successfully');
            }
        }).catch(error => {
            _self.LOG.error('1While flushing cache for module : ', moduleName);
            this.LOG.error(error);
            if (callback) {
                callback(error);
            }
        });
    },

    get: function (cache, hash) {
        this.LOG.debug('Getting value for key : ', hash);
        try {
            return SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].get(cache.client, hash);
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    },

    put: function (cache, hash, value, options) {
        this.LOG.debug('Putting value for key : ', hash);
        try {
            return SERVICE[cache.type.toUpperCaseFirstChar() + 'CacheService'].put(cache.client, hash, value, options);
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    },

    createApiKey: function (request) {
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

    createItemKey: function (input) {
        return {
            pageSize: input.pageSize || CONFIG.get('defaultPageSize'),
            pageNumber: input.pageNumber || CONFIG.get('defaultPageNumber'),
            select: input.select || {},
            sort: input.sort || {},
            query: input.query || {}
        };
    },

    getApi: function (cache, request, response) {
        let hash = SYSTEM.generateHash(this.createApiKey(request));
        return this.get(cache, hash);
    },
    putApi: function (cache, request, response, options) {
        let hash = SYSTEM.generateHash(this.createApiKey(request));
        return this.put(cache, hash, response, options);
    },
    getItem: function (rawSchema, cache, query) {
        //console.log(JSON.stringify(query));
        let hash = rawSchema.modelName + '_' +
            rawSchema.tenant + '_' +
            SYSTEM.generateHash(JSON.stringify(query));
        return this.get(cache, hash);
    },
    putItem: function (rawSchema, cache, query, value) {
        //console.log(JSON.stringify(query));
        let hash = rawSchema.modelName + '_' +
            rawSchema.tenant + '_' +
            SYSTEM.generateHash(JSON.stringify(query));
        return this.put(cache, hash, value, rawSchema.cache);
    }
};