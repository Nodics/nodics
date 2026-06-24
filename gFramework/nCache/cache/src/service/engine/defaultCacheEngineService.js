/**
 * @module nCache/cache/service/engine/DefaultCacheEngineService
 * @description Builds cache channels from layered configuration and validates adapter capabilities before any connection or fallback is activated.
 * @layer service
 * @owner nCache/cache
 * @override Projects may register custom adapters through engine metadata and service overrides while preserving contract version, capability honesty, and fail-closed activation.
 */
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

    /** Returns the initialized channel adapter for one module and channel. */
    getCacheEngine: function (moduleName, channelName) {
        if (this.cacheClients[moduleName] && this.cacheClients[moduleName][channelName]) {
            return this.cacheClients[moduleName][channelName];
        } else {
            return null;
        }
    },

    /** Builds configured cache channels for active modules in deterministic order. */
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

    /** Builds every configured cache channel for one active module. */
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

    /** Validates and initializes one cache channel, applying governed fallback only for supported adapters that fail to connect. */
    buildChannelCacheEngine: function (moduleName, channelName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let channelObj = SERVICE.DefaultCacheConfigurationService.getCacheChannels(moduleName)[channelName];
                if (channelObj.enabled && channelObj.engine) {
                    let engineOptions = SERVICE.DefaultCacheConfigurationService.getCacheEngine(moduleName, channelObj.engine);
                    engineOptions.capabilities = _self.validateEngineContract(channelObj.engine, engineOptions, channelName);
                    engineOptions.options = engineOptions.options || {};
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
                                    channelOptions: channelObj,
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
                            engineOptions.capabilities = _self.validateEngineContract(channelObj.engine, engineOptions, channelName);
                            engineOptions.options = engineOptions.options || {};
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
                                            channelOptions: channelObj,
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

    /** Validates adapter metadata and required handler operations, returning normalized capabilities. */
    validateEngineContract: function (engineName, engineOptions, channelName) {
        if (!engineOptions || engineOptions.supported === false) {
            let reason = engineOptions && engineOptions.unsupportedReason || 'Adapter metadata is missing or unsupported';
            throw new CLASSES.CacheError('ERR_CACHE_00008', 'Cache adapter ' + engineName + ' cannot be activated: ' + reason);
        }
        if (engineOptions.contractVersion !== undefined && engineOptions.contractVersion !== 1) {
            throw new CLASSES.CacheError('ERR_CACHE_00009', 'Unsupported cache adapter contract version for engine: ' + engineName);
        }
        let connectionHandler = SERVICE[engineOptions.connectionHandler];
        let cacheHandler = SERVICE[engineOptions.cacheHandler];
        if (!connectionHandler || (typeof connectionHandler[channelName] !== 'function' && typeof connectionHandler.initCache !== 'function') || !cacheHandler) {
            throw new CLASSES.CacheError('ERR_CACHE_00009', 'Cache adapter handlers are incomplete for engine: ' + engineName);
        }
        let capabilities = SERVICE.DefaultCacheConfigurationService.getEngineCapabilities(engineOptions);
        let required = ['put', 'get'];
        if (capabilities.atomicConsume === true) required.push('consume');
        if (capabilities.prefixFlush === true) required.push('flushByPrefix');
        if (capabilities.keyFlush === true) required.push('flushByKeys');
        let missing = required.filter(operation => {
            let channelOperation = channelName + operation.charAt(0).toUpperCase() + operation.slice(1);
            return typeof cacheHandler[channelOperation] !== 'function' && typeof cacheHandler[operation] !== 'function';
        });
        if (missing.length > 0) {
            throw new CLASSES.CacheError('ERR_CACHE_00009', 'Cache adapter ' + engineName + ' is missing operations: ' + missing.join(', '));
        }
        return capabilities;
    },

    /** Registers configured cache lifecycle events through the selected connection handler. */
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
