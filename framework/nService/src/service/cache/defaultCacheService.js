/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    changeApiCacheConfiguration: function (request) {
        return Promise.reject('not implemented yet, comming soon');
    },

    changeItemCacheConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (UTILS.isBlank(request.config)) {
                    reject('Please validate your request, looks no configuration contain');
                }
                NODICS.getTenants().forEach(tntName => {
                    let model = NODICS.getModels(input.moduleName, tntName)[input.config.modelName];
                    if (model) {
                        model.cache = _.merge(model.cache, input.config.cache || {});
                    }
                });
                resolve('Cache has been updated successfully');
            } catch (error) {
                reject('Facing issue while updating item cache : ' + error.toString());
            }
        });
    },

    initApiCache: function (moduleObject, moduleName) {
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
     * @param {*} request 
     */
    flushApiCache: function (request) {
        if (request.keys && request.keys.length > 0) {
            return this.flushApiCacheByKeys(request);
        } else if (request.prefix) {
            return this.flushApiCacheByPrefix(request);
        } else {
            let moduleObject = NODICS.getModules()[request.moduleName];
            if (moduleObject.apiCache) {
                return this.flush(moduleObject.apiCache);
            } else {
                return Promise.reject('Invalid module or cache configuration');
            }
        }
    },

    /**
     * This function is used to flush all caches for given keys
     * @param {*} request 
     */
    flushApiCacheByKeys: function (request) {
        let moduleObject = NODICS.getModules(request.moduleName);
        if (moduleObject.apiCache && request.keys && request.keys.length > 0) {
            return this.flushKeys(moduleObject.apiCache, request.keys);
        } else {
            Promise.reject('Invalid module or cache configuration');
        }
    },

    /**
     * This function is used to flush cache for keys started by given prefix
     * @param {*} request
     */
    flushApiCacheByPrefix: function (request) {
        let moduleObject = NODICS.getModules()[request.moduleName];
        if (moduleObject.apiCache && request.prefix) {
            return this.flush(moduleObject.apiCache, request.prefix);
        } else {
            return Promise.reject('Invalid module or cache configuration');
        }
    },

    /**
     * This function is used to flush all stored cache for specific keys or prefix
     * @param {*} request
     */
    flushItemCache: function (request) {
        if (request.keys && request.keys.length > 0) {
            return this.flushItemCacheByKeys(request);
        } else if (request.prefix) {
            return this.flushItemCacheByPrefix(request);
        } else {
            let moduleObject = NODICS.getModule(request.moduleName);
            if (moduleObject.itemCache) {
                return this.flush(moduleObject.itemCache);
            } else {
                return Promise.reject('Invalid module or cache configuration');
            }
        }
    },

    /**
     * This function is used to flush all caches for given keys
     * @param {*} request 
     */
    flushItemCacheByKeys: function (request) {
        let moduleObject = NODICS.getModules()[request.moduleName];
        if (moduleObject.itemCache && request.keys && request.keys.length > 0) {
            return this.flushKeys(moduleObject.itemCache, request.keys);
        } else {
            return Promise.reject('Invalid module or cache configuration');
        }
    },

    /**
     * This function is used to flush cache for keys started by given prefix
     * @param {*} request 
     */
    flushItemCacheByPrefix: function (request) {
        let moduleObject = NODICS.getModules()[request.moduleName];
        if (moduleObject.itemCache && request.prefix) {
            return this.flush(moduleObject.itemCache, request.prefix);
        } else {
            return Promise.reject('Invalid module or cache configuration');
        }
    },

    flush: function (cache, prefix) {
        return SERVICE['Default' + cache.type.toUpperCaseFirstChar() + 'CacheService'].flush(cache, prefix);
    },

    flushKeys: function (cache, keys) {
        return SERVICE['Default' + cache.type.toUpperCaseFirstChar() + 'CacheService'].flushKeys(cache, keys);
    },

    get: function (request) {
        this.LOG.debug('Getting value for key : ', request.hashKey);
        try {
            return SERVICE[request.cache.config.handler].get(request.cache, request.hashKey, request.options);
        } catch (error) {
            return Promise.reject(error);
        }
    },

    put: function (request) {
        this.LOG.debug('Putting value for key : ', request.hashKey);
        try {
            return SERVICE[request.cache.config.handler].put(request.cache,
                request.hashKey, request.value,
                request.options);
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

    createItemKey: function (request) {
        let options = _.merge({}, request.options);
        if (request.options) {
            options.recursive = request.options.recursive || false;
        }
        options.query = request.query;
        return request.collection.schemaName + '_' +
            request.tenant + '_' +
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
                options: routerDefinition.cache
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