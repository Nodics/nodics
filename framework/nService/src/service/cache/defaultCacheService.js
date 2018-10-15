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
                if (!moduleObject.apiCache || cacheConfig.apiCache.enabled) {
                    let apiCacheConfig = cacheConfig[cacheConfig.apiCache.engine];
                    SERVICE[apiCacheConfig.handler].initApiCache(apiCacheConfig, moduleName).then(value => {
                        moduleObject.apiCache = {
                            type: cacheConfig.apiCache.engine,
                            client: value,
                            config: apiCacheConfig
                        };
                        resolve();
                    }).catch(error => {
                        _self.LOG.debug('Not able to initialize API cache for :', moduleName, '  :  ', error);
                        if (cacheConfig.apiCache.engine !== 'local' && cacheConfig.apiCache.fallback) {
                            _self.LOG.debug('Initializing local API cache');
                            cacheConfig.apiCache.engine = 'local';
                            let apiCacheConfig = cacheConfig[cacheConfig.apiCache.engine];
                            SERVICE[apiCacheConfig.handler].initApiCache(apiCacheConfig, moduleName).then(value => {
                                moduleObject.apiCache = {
                                    type: cacheConfig.apiCache.engine,
                                    client: value,
                                    config: apiCacheConfig
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
                if (!moduleObject.itemCache || cacheConfig.itemCache.enabled) {
                    let itemCacheConfig = cacheConfig[cacheConfig.itemCache.engine];
                    SERVICE[itemCacheConfig.handler].initItemCache(itemCacheConfig, moduleName).then(value => {
                        moduleObject.itemCache = {
                            type: cacheConfig.itemCache.engine,
                            client: value,
                            config: itemCacheConfig
                        };
                        resolve();
                    }).catch(error => {
                        _self.LOG.error('Not able to initialize Item cache for :', moduleName, '  :  ', error);
                        if (cacheConfig.itemCache.engine !== 'local' && cacheConfig.itemCache.fallback) {
                            _self.LOG.debug('Initializing local Item cache');
                            cacheConfig.itemCache.engine = 'local';
                            let itemCacheConfig = cacheConfig[cacheConfig.itemCache.engine];
                            SERVICE[itemCacheConfig.handler].initApiCache(itemCacheConfig, moduleName).then(value => {
                                moduleObject.itemCache = {
                                    type: cacheConfig.itemCache.engine,
                                    client: value,
                                    config: itemCacheConfig
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

    /**
     * This function is used to flush all stored cache for specific keys or prefix
     * @param {*} input 
     * @param {*} callback 
     */
    flushApiCache: function (request, callback) {
        let input = request.local || request;
        if (input.keys && input.keys.length > 0) {
            if (callback) {
                this.flushApiCacheByKeys(input, callback);
            } else {
                return this.flushApiCacheByKeys(input);
            }
        } else if (input.prefix) {
            if (callback) {
                this.flushApiCacheByPrefix(input, callback);
            } else {
                return this.flushApiCacheByPrefix(input);
            }
        } else {
            let moduleObject = NODICS.getModules()[input.moduleName];
            if (moduleObject.apiCache) {
                if (callback) {
                    this.flush(moduleObject.apiCache).then(success => {
                        callback(null, success);
                    }).catch(error => {
                        callback(error);
                    });
                } else {
                    return this.flush(moduleObject.apiCache);
                }
            } else {
                if (callback) {
                    callback('Invalid module or cache configuration');
                } else {
                    Promise.reject('Invalid module or cache configuration');
                }
            }
        }
    },

    /**
     * This function is used to flush all caches for given keys
     * @param {*} request 
     * @param {*} callback 
     */
    flushApiCacheByKeys: function (request, callback) {
        let input = request.local || request;
        let moduleObject = NODICS.getModules()[input.moduleName];
        if (moduleObject.apiCache && input.keys && input.keys.length > 0) {
            if (callback) {
                this.flushKeys(moduleObject.apiCache, input.keys).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return this.flushKeys(moduleObject.apiCache, input.keys);
            }

        } else {
            if (callback) {
                callback('Invalid module or cache configuration');
            } else {
                Promise.reject('Invalid module or cache configuration');
            }
        }
    },

    /**
     * This function is used to flush cache for keys started by given prefix
     * @param {*} request 
     * @param {*} callback 
     */
    flushApiCacheByPrefix: function (request, callback) {
        let input = request.local || request;
        let moduleObject = NODICS.getModules()[input.moduleName];
        if (moduleObject.apiCache && input.prefix) {
            if (callback) {
                this.flush(moduleObject.apiCache, input.prefix).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return this.flush(moduleObject.apiCache, input.prefix);
            }
        } else {
            if (callback) {
                callback('Invalid module or cache configuration');
            } else {
                Promise.reject('Invalid module or cache configuration');
            }
        }
    },

    /**
     * This function is used to flush all stored cache for specific keys or prefix
     * @param {*} input 
     * @param {*} callback 
     */
    flushItemCache: function (request, callback) {
        let input = request.local || request;
        if (input.keys && input.keys.length > 0) {
            if (callback) {
                this.flushItemCacheByKeys(input, callback);
            } else {
                return this.flushItemCacheByKeys(input);
            }
        } else if (input.prefix) {
            if (callback) {
                this.flushItemCacheByPrefix(input, callback);
            } else {
                return this.flushItemCacheByPrefix(input);
            }
        } else {
            let moduleObject = NODICS.getModules()[input.moduleName];
            if (moduleObject.itemCache) {
                if (callback) {
                    this.flush(moduleObject.itemCache).then(success => {
                        callback(null, success);
                    }).catch(error => {
                        callback(error);
                    });
                } else {
                    return this.flush(moduleObject.itemCache);
                }
            } else {
                if (callback) {
                    callback('Invalid module or cache configuration');
                } else {
                    Promise.reject('Invalid module or cache configuration');
                }
            }
        }
    },

    /**
     * This function is used to flush all caches for given keys
     * @param {*} request 
     * @param {*} callback 
     */
    flushItemCacheByKeys: function (request, callback) {
        let input = request.local || request;
        let moduleObject = NODICS.getModules()[input.moduleName];
        if (moduleObject.itemCache && input.keys && input.keys.length > 0) {
            if (callback) {
                this.flushKeys(moduleObject.itemCache, input.keys).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return this.flushKeys(moduleObject.itemCache, input.keys);
            }

        } else {
            if (callback) {
                callback('Invalid module or cache configuration');
            } else {
                Promise.reject('Invalid module or cache configuration');
            }
        }
    },

    /**
     * This function is used to flush cache for keys started by given prefix
     * @param {*} request 
     * @param {*} callback 
     */
    flushItemCacheByPrefix: function (request, callback) {
        let input = request.local || request;
        let moduleObject = NODICS.getModules()[input.moduleName];
        if (moduleObject.itemCache && input.prefix) {
            if (callback) {
                this.flush(moduleObject.itemCache, input.prefix).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return this.flush(moduleObject.itemCache, input.prefix);
            }
        } else {
            if (callback) {
                callback('Invalid module or cache configuration');
            } else {
                Promise.reject('Invalid module or cache configuration');
            }
        }
    },

    flush: function (cache, prefix) {
        return SERVICE['Default' + cache.type.toUpperCaseFirstChar() + 'CacheService'].flush(cache.client, prefix);
    },

    flushKeys: function (cache, keys) {
        return SERVICE['Default' + cache.type.toUpperCaseFirstChar() + 'CacheService'].flushKeys(cache.client, keys);
    },

    get: function (input) {
        this.LOG.debug('Getting value for key : ', input.hashKey);
        try {
            return SERVICE[input.cacheClient.config.handler].get(input.cacheClient.client, input.hashKey);
        } catch (error) {
            return new Promise((resolve, reject) => {
                reject(error);
            });
        }
    },

    put: function (input) {
        this.LOG.debug('Putting value for key : ', input.hashKey);
        try {
            return SERVICE[input.cacheClient.config.handler].put(input.cacheClient.client,
                input.hashKey, input.docs,
                input.itemCacheOptions);
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
        let options = _.merge({}, input.options);
        if (input.options) {
            options.recursive = input.options.recursive || false;
        }
        options.query = input.query;
        return input.collection.schemaName + '_' +
            input.tenant + '_' +
            SYSTEM.generateHash(JSON.stringify(options));
    },

    getApi: function (cache, request, response, options) {
        let hash = options.prefix ? options.prefix + '_' + SYSTEM.generateHash(this.createApiKey(request)) : SYSTEM.generateHash(this.createApiKey(request));
        return this.get({
            cacheClient: cache,
            hashKey: hash
        });
    },
    putApi: function (cache, request, response, options) {
        let hash = options.prefix ? options.prefix + '_' + SYSTEM.generateHash(this.createApiKey(request)) : SYSTEM.generateHash(this.createApiKey(request));
        return this.put({
            cacheClient: cache,
            hashKey: hash,
            docs: response,
            itemCacheOptions: options
        });
    }
};