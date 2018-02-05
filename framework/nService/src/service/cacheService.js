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
    initApplicationCache: function(moduleName) {
        return new Promise((resolev, reject) => {
            let cache = CONFIG.get('cache');
            let moduleObject = NODICS.getModules()[moduleName];
            if (!moduleObject.apiCache) {
                let cacheConfig = _.merge(_.merge({}, cache.default || {}), cache[moduleName] || {});
                if (cacheConfig.apiCache.enabled) {
                    if (cacheConfig.apiCache.engine === 'local') {
                        console.log('   INFO: Initializing local API Cache instance for module: ', moduleName);
                        resolev({
                            type: 'local',
                            client: new NodeCache(cacheConfig.localOptions)
                        });
                    } else {
                        console.log('   INFO: Initializing redis API cache instance for module: ', moduleName);
                        resolev({
                            type: 'local',
                            client: this.initializeRedisCacheInstence()
                        });
                    }
                }
            }
        });
    },

    initializeRedisCacheInstence: function() {

    },

    invalidateCache: function(request, callback) {
        try {
            let moduleObject = NODICS.getModules()[request.moduleName];
            if (moduleObject.cache) {
                if (moduleObject.cache.type === 'local') {
                    moduleObject.cache.client.flushAll();
                    callback(null, 'api cache for module : ' + request.moduleName + ', flushed successfully');
                }
            }
        } catch (error) {
            callback(error);
        }
    },

    generateCacheKey: function(request) {
        let key = request.originalUrl;
        const method = request.method;
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
        let hash = method + '-' + SYSTEM.generateHash(key);
        return hash;
    },

    get: function(cache, request, response) {
        return new Promise((resolve, reject) => {
            let hash = this.generateCacheKey(request);
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

    put: function(cache, request, value, options) {
        return new Promise((resolve, reject) => {
            try {
                let hash = this.generateCacheKey(request);
                if (cache.type === 'local') {
                    if (options.ttl) {
                        cache.client.set(hash, value, router.ttl);
                        resolve(true);
                    } else {
                        cache.client.set(hash, value);
                        resolve(true);
                    }
                }
                reject('Invalid client configuration');
            } catch (error) {
                reject('Not able to save in cache');
            }
        });
    }
};