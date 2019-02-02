/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const redis = require("redis");
const _ = require('lodash');

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    initCache: function (redisCacheConfig, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.info('Initializing Redis API Cache instance for module: ', moduleName);
            redisCacheConfig.options.db = redisCacheConfig.options.db || 0;
            let client = redis.createClient(redisCacheConfig.options);
            client.on("error", err => {
                reject(err);
            });
            client.on("connect", success => {
                resolve(client);
            });
            client.on("ready", function (err) {
                _self.LOG.debug('Item redis client is ready for module : ', moduleName);
            });
        });
    },

    registerEvents: function (options) {
        let moduleObject = NODICS.getModule(options.moduleName);
        options.publishClient.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], function (error, success) {
            let client = redis.createClient(options.cacheOptions);
            _.each(options.options.events, (trigger, event) => {
                let serviceName = trigger.substring(0, trigger.indexOf('.'));
                let functionName = trigger.substring(trigger.indexOf('.') + 1, trigger.length);
                client.subscribe('__keyevent@' + options.cacheOptions.db + '__:' + event, function () {
                    client.on('message', function (channel, key) {
                        if (key.startsWith('authToken_')) {
                            key = key.substring(10, key.length);
                        }
                        SERVICE[serviceName][functionName](key, null, {
                            moduleName: options.moduleName,
                            moduleObject: moduleObject
                        });
                    });
                });
            });
        });
    },

    get: function (cache, hashKey, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                hashKey = (cache.cacheMap) ? cache.cacheMap + '_' + hashKey : hashKey;
                _self.LOG.debug('Getting value from Redis cache storage with key: ' + hashKey);
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
                            result: JSON.parse(value)
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
                if (ttl) {
                    cache.client.set(hashKey, JSON.stringify(value), 'EX', ttl);
                } else {
                    cache.client.set(hashKey, JSON.stringify(value));
                }
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
        let _self = this;
        return new Promise((resolve, reject) => {
            if (prefix) {
                prefix = (cache.cacheMap) ? cache.cacheMap + '_' + prefix : prefix;
                if (!prefix.endsWith('*')) {
                    prefix += '*';
                }
                _self.LOG.debug('Flushing value in Redis cache stored with prefix: ' + prefix);
                cache.client.keys(prefix, function (err, cacheKeys) {
                    if (cacheKeys) {
                        cacheKeys.forEach(key => {
                            client.del(key);
                        });
                    }
                    resolve({
                        success: true,
                        code: 'SUC_CACHE_00000',
                        result: cacheKeys
                    });
                });
            } else {
                cache.client.keys(function (err, cacheKeys) {
                    cache.client.flushAll();
                    resolve({
                        success: true,
                        code: 'SUC_CACHE_00000',
                        result: cacheKeys
                    });
                });
            }
        });
    },

    flushKeys: function (cache, keys) {
        let _self = this;
        if (keys && keys.length > 0) {
            for (var i = 0; i < keys.length; i++) {
                keys[i] = (cache.cacheMap) ? cache.cacheMap + '_' + keys[i] : keys[i];
            }
        }
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Flushing value in Redis cache stored with keys: ' + keys);
            cache.client.del(keys);
            resolve({
                success: true,
                code: 'SUC_CACHE_00000',
                result: keys
            });
        });
    },
};