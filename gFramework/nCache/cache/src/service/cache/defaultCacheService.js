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
        try {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                let operationName = 'put';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Put'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Put'] === 'function') {
                    operationName = options.channelName + 'Put';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                return Promise.reject({
                    success: false,
                    code: 'ERR_CACHE_00010',
                    msg: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                });
            }
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_CACHE_00000',
                error: error
            });
        }
    },

    get: function (options) {
        try {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                let operationName = 'get';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Get'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Get'] === 'function') {
                    operationName = options.channelName + 'Get';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                return Promise.reject({
                    success: false,
                    code: 'ERR_CACHE_00010',
                    msg: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                });
            }
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_CACHE_00000',
                error: error
            });
        }
    },


    flushCache: function (options) {
        try {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                let operationName = 'flushCache';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushCache'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushCache'] === 'function') {
                    operationName = options.channelName + 'FlushCache';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                Promise.reject({
                    success: false,
                    code: 'ERR_CACHE_00010',
                    msg: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                });
            }
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_CACHE_00000',
                error: error
            });
        }
    },

    flushCacheKeys: function (options) {
        try {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                let operationName = 'flushCacheKeys';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushCacheKeys'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushCacheKeys'] === 'function') {
                    operationName = channelName + 'FlushCacheKeys';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                Promise.reject({
                    success: false,
                    code: 'ERR_CACHE_00010',
                    msg: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                });
            }
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_CACHE_00000',
                error: error
            });
        }
    }
};