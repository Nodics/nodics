/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const redis = require("redis");

module.exports = {

    initApiCache: function (redisCacheConfig, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.info('Initializing Redis API Cache instance for module: ', moduleName);
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

    initItemCache: function (redisCacheConfig, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.debug('Initializing Redis Item Cache instance for module: ', moduleName);
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

    get: function (client, hashKey) {
        return new Promise((resolve, reject) => {
            try {
                client.get(hashKey, (error, value) => {
                    if (error) {
                        reject(error);
                    } else if (value) {
                        resolve(JSON.parse(value));
                    } else {
                        reject(false);
                    }
                });
            } catch (error) {
                reject(error);
            }

        });
    },

    put: function (client, hashKey, value, options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.ttl) {
                    client.set(hashKey, JSON.stringify(value), 'EX', options.ttl);
                } else {
                    client.set(hashKey, JSON.stringify(value));
                }
                resolve();
            } catch (error) {
                reject(error);
            }

        });
    },

    flush: function (client, prefix) {
        return new Promise((resolve, reject) => {
            if (prefix) {
                if (!prefix.endsWith('*')) {
                    prefix += '*';
                }
                client.keys(prefix, function (err, cacheKeys) {
                    if (cacheKeys) {
                        cacheKeys.forEach(key => {
                            client.del(key);
                        });
                    }
                    resolve(cacheKeys);
                });
            } else {
                client.keys(function (err, cacheKeys) {
                    client.flushAll();
                    resolve(cacheKeys);
                });
            }
        });
    },

    flushKeys: function (client, keys) {
        return new Promise((resolve, reject) => {
            client.del(keys);
            resolve(keys);
        });
    },
};