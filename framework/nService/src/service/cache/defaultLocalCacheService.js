/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const NodeCache = require("node-cache");

module.exports = {

    initApiCache: function (localCacheConfig, moduleName) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Initializing local API Cache instance for module: ', moduleName);
            resolve(new NodeCache(localCacheConfig.options));
        });
    },

    initItemCache: function (localCacheConfig, moduleName) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Initializing local Item Cache instance for module: ', moduleName);
            resolve(new NodeCache(localCacheConfig.options));
        });
    },

    get: function (client, hashKey) {
        return new Promise((resolve, reject) => {
            try {
                client.get(hashKey, (error, value) => {
                    if (error) {
                        reject(error);
                    } else if (value) {
                        resolve(value);
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
                if (options && options.ttl) {
                    client.set(hashKey, value, options.ttl);
                } else {
                    client.set(hashKey, value);
                }
                resolve();
            } catch (error) {
                reject(error);
            }

        });
    },

    flush: function (client, prefix) {
        return new Promise((resolve, reject) => {
            client.keys(function (err, cacheKeys) {
                if (prefix) {
                    let delKeys = [];
                    cacheKeys.forEach(key => {
                        if (key.startsWith(prefix)) {
                            client.del(key);
                            delKeys.push(key);
                        }
                    });
                    resolve(delKeys);
                } else {
                    client.flushAll();
                    resolve(cacheKeys);
                }
            });
        });
    },

    flushKeys: function (client, keys) {
        return new Promise((resolve, reject) => {
            client.del(keys);
            resolve(keys);
        });
    },
};