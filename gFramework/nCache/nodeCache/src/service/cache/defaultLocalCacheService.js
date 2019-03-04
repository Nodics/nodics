/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    put: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let key = options.channel.channelName + '_' + options.channel.engineOptions.options.prefix + '_' + options.key;
                // this will allow user to keep value for infinite time
                let ttl = 0;
                if (options.ttl === undefined || options.ttl > 0) {
                    ttl = options.ttl || options.channel.chennalOptions.ttl || options.channel.engineOptions.ttl || options.channel.engineOptions.options.ttl;
                }
                this.LOG.debug('Putting value in Local cache storage with key: ' + key + ' TTL: ' + ttl);
                options.channel.client.set(key, options.value, ttl || 0);
                resolve({
                    success: true,
                    code: 'SUC_CACHE_00000',
                    result: options.value
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

    get: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let key = options.channel.channelName + '_' + options.channel.engineOptions.options.prefix + '_' + options.key;
                this.LOG.debug('Getting value from Local cache storage with key: ' + key);
                options.channel.client.get(key, (error, value) => {
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

    flushCache: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.LOG.debug('Flushing value in local cache stored with prefix: ' + (options.prefix) ? options.prefix : 'All');
                options.channel.client.keys(function (err, cacheKeys) {
                    if (err) {
                        reject({
                            success: false,
                            code: 'ERR_CACHE_00000',
                            error: error
                        });
                    } else {
                        if (options.prefix) {
                            let prefix = options.channel.channelName + '_' + options.channel.engineOptions.options.prefix + '_' + options.prefix;
                            let delKeys = [];
                            cacheKeys.forEach(key => {
                                if (key.startsWith(prefix)) {
                                    options.channel.client.del(key);
                                    delKeys.push(key);
                                }
                            });
                            resolve({
                                success: true,
                                code: 'SUC_CACHE_00000',
                                result: delKeys
                            });
                        } else {
                            options.channel.client.flushAll();
                            resolve({
                                success: true,
                                code: 'SUC_CACHE_00000',
                                result: cacheKeys
                            });
                        }
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
    flushCacheKeys: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let _self = this;
                let tmpKeys = [];
                if (options.keys && options.keys.length > 0) {
                    for (var i = 0; i < options.keys.length; i++) {
                        tmpKeys[i] = options.channel.channelName + '_' + options.channel.engineOptions.options.prefix + '_' + options.keys[i];
                    }
                }
                _self.LOG.debug('Flushing value in local cache stored with keys: ' + tmpKeys);
                options.channel.client.del(tmpKeys);
                resolve({
                    success: true,
                    code: 'SUC_CACHE_00000',
                    result: tmpKeys
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_CACHE_00000',
                    error: error
                });
            }
        });
    }
};