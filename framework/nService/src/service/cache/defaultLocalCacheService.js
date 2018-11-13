/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const NodeCache = require("node-cache");
const _ = require('lodash');

module.exports = {

    initCache: function (localCacheConfig, moduleName) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Initializing local Cache instance for module: ', moduleName);
            resolve(new NodeCache(localCacheConfig.options));
        });
    },

    registerEvents: function (options) {
        let moduleObject = NODICS.getModule(options.moduleName);
        _.each(options.options.events, (trigger, event) => {
            let serviceName = trigger.substring(0, trigger.indexOf('.'));
            let functionName = trigger.substring(trigger.indexOf('.') + 1, trigger.length);
            options.publishClient.on(event, function (key, value) {
                if (key.startsWith('authToken_')) {
                    key = key.substring(10, key.length);
                }
                SERVICE[serviceName][functionName](key, value, {
                    moduleName: options.moduleName,
                    moduleObject: moduleObject
                });
            });
        });
    },

    get: function (cache, hashKey, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                hashKey = (cache.cacheMap) ? cache.cacheMap + '_' + hashKey : hashKey;
                _self.LOG.debug('Getting value from local cache storage with key: ' + hashKey);
                cache.client.get(hashKey, (error, value) => {
                    if (error) {
                        reject({
                            success: false,
                            code: 'ERR_CACHE_00000',
                            error: error
                        });
                    } else if (value) {
                        resolve({
                            success: true,
                            code: 'SUC_CACHE_00000',
                            result: value
                        });
                    } else {
                        reject({
                            success: false,
                            code: 'ERR_CACHE_00001'
                        });
                    }
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_CACHE_00000',
                    error: error
                });
            }

        });
    },

    put: function (cache, hashKey, value, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                hashKey = (cache.cacheMap) ? cache.cacheMap + '_' + hashKey : hashKey;
                let ttl = options.ttl;
                if (ttl === undefined && cache.config && cache.config.ttl) {
                    ttl = cache.config.ttl;
                }
                _self.LOG.debug('Putting value is local cache storage with key: ' + hashKey + ' TTL: ' + ttl);
                cache.client.set(hashKey, value, ttl || 0);
                resolve({
                    success: true,
                    code: 'SUC_CACHE_00000',
                    result: value
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_CACHE_00000',
                    error: error
                });
            }

        });
    },

    flush: function (cache, prefix) {
        return new Promise((resolve, reject) => {
            prefix = (cache.cacheMap) ? cache.cacheMap + '_' + prefix : prefix;
            cache.client.keys(function (err, cacheKeys) {
                if (prefix) {
                    let delKeys = [];
                    cacheKeys.forEach(key => {
                        if (key.startsWith(prefix)) {
                            cache.client.del(key);
                            delKeys.push(key);
                        }
                    });
                    resolve({
                        success: true,
                        code: 'SUC_CACHE_00000',
                        result: delKeys
                    });
                } else {
                    client.flushAll();
                    resolve({
                        success: true,
                        code: 'SUC_CACHE_00000',
                        result: cacheKeys
                    });
                }
            });
        });
    },

    flushKeys: function (cache, keys) {
        if (keys && keys.length > 0) {
            for (var i = 0; i < keys.length; i++) {
                keys[i] = (cache.cacheMap) ? cache.cacheMap + '_' + keys[i] : keys[i];
            }
        }
        return new Promise((resolve, reject) => {
            cache.client.del(keys);
            resolve({
                success: true,
                code: 'SUC_CACHE_00000',
                result: keys
            });
        });
    },
};