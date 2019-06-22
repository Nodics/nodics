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
            if (options.keys && options.keys instanceof Array && options.keys.length > 0) {
                return this.flushByKeys(options);
            } else {
                return this.flushByPrefix(options);
            }
        } catch (error) {
            return Promise.reject({
                success: false,
                code: 'ERR_CACHE_00000',
                error: error
            });
        }
    },

    flushByPrefix: function (options) {
        try {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                let operationName = 'flushByPrefix';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByPrefix'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByPrefix'] === 'function') {
                    operationName = options.channelName + 'FlushByPrefix';
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

    flushByKeys: function (options) {
        try {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                let operationName = 'flushByKeys';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByKeys'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByKeys'] === 'function') {
                    operationName = channelName + 'FlushByKeys';
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

    getSearchCacheChannel: function (schemaName) {
        let channelName = 'search';
        if (CONFIG.get('cache').schemaCacheChannelNameMapping && CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName]) {
            channelName = CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName];
        }
        return channelName;
    },

    getSchemaCacheChannel: function (schemaName) {
        let channelName = 'schema';
        if (CONFIG.get('cache').schemaCacheChannelNameMapping && CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName]) {
            channelName = CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName];
        }
        return channelName;
    },

    getRouterCacheChannel: function (routerName) {
        let channelName = 'router';
        if (CONFIG.get('cache').routerCacheChannelNameMapping && CONFIG.get('cache').routerCacheChannelNameMapping[routerName]) {
            channelName = CONFIG.get('cache').routerCacheChannelNameMapping[routerName];
        }
        return channelName;
    },

    getAuthCacheChannel: function (tenant) {
        let channelName = 'auth';
        if (CONFIG.get('cache').authCacheChannelNameMapping && CONFIG.get('cache').authCacheChannelNameMapping[tenant]) {
            channelName = CONFIG.get('cache').authCacheChannelNameMapping[tenant];
        }
        return channelName;
    },






    updateRouterCacheConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (UTILS.isBlank(request.config)) {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00005'
                    });
                } else if (!request.config.routerName) {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00006'
                    });
                } else {
                    let key = request.moduleName;
                    if (request.config.schemaName) {
                        key = key + '_' + request.config.schemaName;
                    }
                    key = key + '_' + request.config.routerName;
                    let routerDefinition = NODICS.getRouter(key.toLowerCase(), request.moduleName);
                    if (routerDefinition) {
                        routerDefinition.cache = _.merge(routerDefinition.cache || {}, request.config.cache);
                        resolve({
                            success: true,
                            code: 'SUC_CACHE_00000'
                        });
                    } else {
                        let msg = 'Could not found router definition for router name: ' + request.config.routerName;
                        if (request.config.schemaName) {
                            msg = msg + ' and schemaName: ' + request.config.schemaName;
                        }
                        reject({
                            success: false,
                            code: 'ERR_CACHE_00007',
                            msg: msg
                        });
                    }
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_CACHE_00000',
                    msg: 'Facing issue while updating router cache : ' + error.toString()
                });
            }
        });
    },

    updateSchemaCacheConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (UTILS.isBlank(request.config)) {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00005'
                    });
                } else if (!request.config.schemaName) {
                    reject({
                        success: false,
                        code: 'ERR_CACHE_00008'
                    });
                } else {
                    let modelName = UTILS.createModelName(request.config.schemaName);
                    NODICS.getActiveTenants().forEach(tntName => {
                        let model = NODICS.getModels(request.moduleName, tntName)[modelName];
                        if (model) {
                            model.cache = _.merge(model.cache, request.config.cache || {});
                            resolve({
                                success: true,
                                code: 'SUC_CACHE_00000'
                            });
                        } else {
                            reject({
                                success: false,
                                code: 'ERR_CACHE_00007',
                                msg: 'Invalid schemaName: ' + request.config.schemaName + ' to update item cache'
                            });
                        }
                    });
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_CACHE_00000',
                    msg: 'Facing issue while updating item cache : ' + error.toString()
                });
            }
        });
    },
};