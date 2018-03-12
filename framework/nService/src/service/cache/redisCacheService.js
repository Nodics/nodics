/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const redis = require("redis");

module.exports = {

    initApiCache: function(options, moduleName) {
        return new Promise((resolve, reject) => {
            console.log('   INFO: Initializing Redis API Cache instance for module: ', moduleName);
            let client = redis.createClient(options);
            client.on("error", err => {
                reject(err);
            });
            client.on("connect", success => {
                resolve(client);
            });
            client.on("ready", function(err) {
                console.log('   INFO: Item redis client is ready for module : ', moduleName);
            });
        });
    },

    initItemCache: function(options, moduleName) {
        return new Promise((resolve, reject) => {
            console.log('   INFO: Initializing Redis Item Cache instance for module: ', moduleName);
            let client = redis.createClient(options);
            client.on("error", err => {
                reject(err);
            });
            client.on("connect", success => {
                resolve(client);
            });
            client.on("ready", function(err) {
                console.log('   INFO: Item redis client is ready for module : ', moduleName);
            });
        });
    },

    get: function(client, hashKey) {
        return new Promise((resolve, reject) => {
            try {
                client.get(hashKey, (error, value) => {
                    if (error) {
                        reject(error);
                    } else if (value) {
                        resolve(JSON.parse(value));
                    } else {
                        reject();
                    }
                });
            } catch (error) {
                reject(error);
            }

        });
    },

    put: function(client, hashKey, value, options) {
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

    flush: function(client, prefix) {
        return new Promise((resolve, reject) => {
            if (prefix) {
                if (!prefix.endsWith('*')) {
                    prefix += '*';
                }
                client.keys(function(err, cacheKeys) {
                    if (cacheKeys) {
                        cacheKeys.forEach(key => {
                            client.del(key);
                        });
                    }
                    resolve(true);
                });
            } else {
                client.flushAll();
                resolve(true);
            }
        });
    },

    flushKeys: function(client, keys) {
        return new Promise((resolve, reject) => {
            client.del(keys);
            resolve(true);
        });
    },
};