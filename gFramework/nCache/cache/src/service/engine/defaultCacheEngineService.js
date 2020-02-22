/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    cacheClients: {},
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

    getCacheEngine: function (moduleName, channelName) {
        if (this.cacheClients[moduleName] && this.cacheClients[moduleName][channelName]) {
            return this.cacheClients[moduleName][channelName];
        } else {
            return null;
        }
    },

    buildCacheEngines: function (modules = Object.keys(NODICS.getModules())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (modules && modules.length > 0) {
                    let moduleName = modules.shift();
                    let channels = SERVICE.DefaultCacheConfigurationService.getCacheChannels(moduleName);
                    if (channels && !UTILS.isBlank(channels)) {
                        _self.buildModuleCacheEngine(moduleName, Object.keys(channels)).then(success => {
                            _self.buildCacheEngines(modules).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.LOG.warn('Could not found any cache channels configured for module: ' + moduleName);
                        _self.buildCacheEngines(modules).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(new CLASSES.CacheError(error));
            }
        });
    },

    buildModuleCacheEngine: function (moduleName, channels) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (channels && channels.length > 0) {
                    let channelName = channels.shift();
                    _self.buildChannelCacheEngine(moduleName, channelName).then(success => {
                        if (success.code === 'SUC_CACHE_00000') {
                            if (!this.cacheClients[moduleName]) {
                                this.cacheClients[moduleName] = {};
                            }
                            this.cacheClients[moduleName][channelName] = success.result;
                        }
                        _self.buildModuleCacheEngine(moduleName, channels).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(new CLASSES.CacheError(error));
            }
        });
    },

    buildChannelCacheEngine: function (moduleName, channelName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let channelObj = SERVICE.DefaultCacheConfigurationService.getCacheChannels(moduleName)[channelName];
                if (channelObj.enabled && channelObj.engine) {
                    let engineOptions = SERVICE.DefaultCacheConfigurationService.getCacheEngine(moduleName, channelObj.engine);
                    engineOptions.options.prefix = moduleName;
                    let operationName = 'initCache';
                    if (SERVICE[engineOptions.connectionHandler][channelName] && typeof SERVICE[engineOptions.connectionHandler][channelName] === 'function') {
                        operationName = channelName;
                    }
                    SERVICE[engineOptions.connectionHandler][operationName](engineOptions, moduleName).then(value => {
                        if (value.code === 'SUC_CACHE_00000') {
                            _self.registerEvents(engineOptions, moduleName, value.result, channelObj);
                            resolve({
                                code: 'SUC_CACHE_00000',
                                result: {
                                    chennalOptions: channelObj,
                                    engineOptions: engineOptions,
                                    client: value.result,
                                    channelName: channelName
                                }
                            });
                        } else {
                            resolve(value);
                        }
                    }).catch(error => {
                        _self.LOG.warn('Not able to initialize cache for module: ' + moduleName + ', and channel: ' + channelName + '  :  ', error);
                        if (channelObj.engine !== 'local' && channelObj.fallback) {
                            _self.LOG.debug('Initializing local API cache');
                            channelObj.engine = 'local';
                            let engineOptions = SERVICE.DefaultCacheConfigurationService.getCacheEngine(moduleName, channelObj.engine);
                            engineOptions.options.prefix = moduleName;
                            let operationName = 'initCache';
                            if (SERVICE[engineOptions.connectionHandler][channelName] && typeof SERVICE[engineOptions.connectionHandler][channelName] === 'function') {
                                operationName = channelName;
                            }
                            SERVICE[engineOptions.connectionHandler][operationName](engineOptions, moduleName).then(value => {
                                if (value.code === 'SUC_CACHE_00000') {
                                    _self.registerEvents(engineOptions, moduleName, value.result, channelObj);
                                    resolve({
                                        code: 'SUC_CACHE_00000',
                                        result: {
                                            chennalOptions: channelObj,
                                            engineOptions: engineOptions,
                                            client: value.result,
                                            channelName: channelName
                                        }
                                    });
                                } else {
                                    resolve(value);
                                }
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            reject(new CLASSES.CacheError('ERR_CACHE_00000', 'Cache fallback is not allowed for module: ' + moduleName + ', and channel: ' + channelName));
                        }
                    });
                } else {
                    reject(new CLASSES.CacheError('ERR_CACHE_00000', 'Invalid engine configuration for module: ' + moduleName + ', and channel: ' + channelName));
                }
            } catch (error) {
                reject(new CLASSES.CacheError(error));
            }
        });
    },

    registerEvents: function (engineOptions, moduleName, client, options) {
        if (!UTILS.isBlank(options.events)) {
            SERVICE[engineOptions.connectionHandler].registerEvents({
                moduleName: moduleName,
                cacheOptions: engineOptions.options,
                options: options,
                publishClient: client,
            });
        }
    },
};
