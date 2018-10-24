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
            NODICS.getTenants().forEach(tntName => {
                let model = NODICS.getModels(input.moduleName, tntName)[input.config.modelName];
                if (model) {
                    model.cache = _.merge(model.cache, input.config.cache || {});
                }
            });
            if (callback) {
                callback(null, 'Cache has been updated successfully');
            } else {
                Promise.resolve('Cache has been updated successfully');
            }
        } catch (error) {
            if (callback) {
                callback('Facing issue while updating item cache : ' + error.toString());
            } else {
                Promise.reject('Facing issue while updating item cache : ' + error.toString());
            }
        }
    },

    initApiCache: function (moduleObject, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let cache = CONFIG.get('cache');
                let cacheConfig = _.merge(_.merge({}, cache.default || {}), cache[moduleName] || {});
                if (moduleObject.metaData && moduleObject.metaData.publish &&
                    !moduleObject.apiCache && cacheConfig.apiCache.enabled) {
                    SERVICE.DefaultCacheService.initCache(moduleName, cacheConfig, cacheConfig.apiCache).then(success => {
                        moduleObject.apiCache = success;
                        moduleObject.apiCache.cacheMap = 'api';
                        resolve(true);
                    }).catch(error => {
                        reject('Fsiled Init cache for: ' + moduleName + ' : ' + error);
                    });
                }
            } catch (error) {
                reject('Fsiled Init cache for: ' + moduleName + ' : ' + error);
            }
        });
    },

    initItemCache: function (moduleObject, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let cache = CONFIG.get('cache');
                let cacheConfig = _.merge(_.merge({}, cache.default || {}), cache[moduleName] || {});
                if (!moduleObject.itemCache || cacheConfig.itemCache.enabled) {
                    SERVICE.DefaultCacheService.initCache(moduleName, cacheConfig, cacheConfig.itemCache).then(success => {
                        moduleObject.itemCache = success;
                        moduleObject.itemCache.cacheMap = 'model';
                        resolve(true);
                    }).catch(error => {
                        reject('Fsiled Init cache for: ' + moduleName + ' : ' + error);
                    });
                }
            } catch (error) {
                reject('Fsiled Init cache for: ' + moduleName + ' : ' + error);
            }
        });
    },

    initAuthCache: function (moduleObject, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let cache = CONFIG.get('cache');
                let cacheConfig = _.merge(_.merge({}, cache.default || {}), cache[moduleName] || {});
                if (!moduleObject.authCache || cacheConfig.authCache.enabled) {
                    SERVICE.DefaultCacheService.initCache(moduleName, cacheConfig, cacheConfig.authCache).then(success => {
                        moduleObject.authCache = success;
                        moduleObject.authCache.cacheMap = 'authToken';
                        resolve(true);
                    }).catch(error => {
                        reject('Fsiled Init cache for: ' + moduleName + ' : ' + error);
                    });
                }
            } catch (error) {
                reject('Fsiled Init cache for: ' + moduleName + ' : ' + error);
            }
        });
    },

    initCache: function (moduleName, cacheConfig, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let cacheOptions = cacheConfig[options.engine];
            cacheOptions.options.prefix = moduleName + '_';
            SERVICE[cacheOptions.handler].initCache(cacheOptions, moduleName).then(value => {
                resolve({
                    type: options.engine,
                    client: value,
                    config: cacheOptions
                });
                _self.registerEvents(cacheOptions, moduleName, value, options);
            }).catch(error => {
                _self.LOG.debug('Not able to initialize API cache for :', moduleName, '  :  ', error);
                if (options.engine !== 'local' && options.fallback) {
                    _self.LOG.debug('Initializing local API cache');
                    options.engine = 'local';
                    let cacheOptions = cacheConfig[options.engine];
                    SERVICE[cacheOptions.handler].initCache(cacheOptions, moduleName).then(value => {
                        resolve({
                            type: options.engine,
                            client: value,
                            config: cacheOptions
                        });
                        _self.registerEvents(cacheOptions, moduleName, value, options);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject('Cache fallback is not allowed for module: ' + moduleName);
                }
            });
        });
    },

    registerEvents: function (cacheOptions, moduleName, client, options) {
        if (!UTILS.isBlank(options.events)) {
            SERVICE[cacheOptions.handler].registerEvents({
                moduleName: moduleName,
                cacheOptions: cacheOptions.options,
                options: options,
                publishClient: client,
            });
        }
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
        return SERVICE['Default' + cache.type.toUpperCaseFirstChar() + 'CacheService'].flush(cache, prefix);
    },

    flushKeys: function (cache, keys) {
        return SERVICE['Default' + cache.type.toUpperCaseFirstChar() + 'CacheService'].flushKeys(cache, keys);
    },

    get: function (input) {
        this.LOG.debug('Getting value for key : ', input.hashKey);
        try {
            return SERVICE[input.cache.config.handler].get(input.cache, input.hashKey, input.options);
        } catch (error) {
            Promise.reject(error);
        }
    },

    put: function (input) {
        this.LOG.debug('Putting value for key : ', input.hashKey);
        try {
            return SERVICE[input.cache.config.handler].put(input.cache,
                input.hashKey, input.value,
                input.options);
        } catch (error) {
            Promise.reject(error);
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

    getApi: function (routerDefinition, cacheKeyHash) {
        if (routerDefinition.cache &&
            routerDefinition.cache.enabled &&
            routerDefinition.moduleObject.apiCache) {
            cacheKeyHash = routerDefinition.cache.prefix ? routerDefinition.cache.prefix + '_' + cacheKeyHash : cacheKeyHash;
            return this.get({
                cache: routerDefinition.moduleObject.apiCache,
                hashKey: cacheKeyHash,
                options: options
            });
        } else {
            return Promise.reject(true);
        }
    },

    putApi: function (routerDefinition, cacheKeyHash, value) {
        if (value && routerDefinition.cache &&
            routerDefinition.cache.enabled &&
            routerDefinition.moduleObject.apiCache) {
            cacheKeyHash = routerDefinition.cache.prefix ? routerDefinition.cache.prefix + '_' + cacheKeyHash : cacheKeyHash;
            return this.put({
                cache: routerDefinition.moduleObject.apiCache,
                hashKey: cacheKeyHash,
                value: value,
                options: routerDefinition.cache
            });
        } else {
            return Promise.reject(true);
        }
    }
};