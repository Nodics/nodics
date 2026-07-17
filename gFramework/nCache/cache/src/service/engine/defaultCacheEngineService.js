/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCache/cache/service/engine/DefaultCacheEngineService
 * @description Builds cache channels from layered configuration and validates adapter capabilities before any connection or fallback is activated.
 * @layer service
 * @owner nCache/cache
 * @override Projects may register custom adapters through engine metadata and service overrides while preserving contract version, capability honesty, and fail-closed activation.
 */
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    cacheClients: {},
    engineClients: {},
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

    /** Returns the initialized engine client for one module and engine. */
    getEngineClient: function (moduleName, engineName) {
        if (this.engineClients[moduleName] && this.engineClients[moduleName][engineName]) {
            return this.engineClients[moduleName][engineName];
        } else {
            return null;
        }
    },

    /** Returns whether the cache subsystem is enabled by layered configuration. */
    isCacheEnabled: function () {
        let cacheConfig = CONFIG.get('cache') || {};
        return cacheConfig.enabled !== false;
    },

    /** Returns true when a value is empty without requiring global utility bootstrap. */
    isBlank: function (value) {
        if (typeof UTILS !== 'undefined' && typeof UTILS.isBlank === 'function') return UTILS.isBlank(value);
        return value === undefined || value === null || (_.isObject(value) && _.isEmpty(value));
    },

    /** Writes optional service logs only when the runtime logger has been injected. */
    log: function (level, message, details) {
        if (this.LOG && typeof this.LOG[level] === 'function') {
            if (details !== undefined) this.LOG[level](message, details);
            else this.LOG[level](message);
        }
    },

    /** Builds configured cache channels for active modules in deterministic order. */
    buildCacheEngines: function (modules = Object.keys(NODICS.getModules())) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (!_self.isCacheEnabled()) {
                    _self.log('info', 'Cache subsystem is disabled by configuration; skipping cache engine startup');
                    resolve(true);
                    return;
                }
                if (modules && modules.length > 0) {
                    let moduleName = modules.shift();
                    let channels = SERVICE.DefaultCacheConfigurationService.getCacheChannels(moduleName);
                    _self.buildEnabledModuleEngines(moduleName).then(() => {
                    if (channels && !_self.isBlank(channels)) {
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
                            _self.log('warn', 'Could not found any cache channels configured for module: ' + moduleName);
                            _self.buildCacheEngines(modules).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }
                    }).catch(error => reject(error));
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(new CLASSES.CacheError(error));
            }
        });
    },

    /** Initializes every enabled cache engine for one active module before channel binding. */
    buildEnabledModuleEngines: function (moduleName) {
        let engines = SERVICE.DefaultCacheConfigurationService.getCacheEngines(moduleName) || {};
        let enabledEngines = Object.keys(engines).filter(engineName => engines[engineName] && engines[engineName].enabled !== false);
        if (enabledEngines.length === 0) {
            this.log('warn', 'No enabled cache engines configured for module: ' + moduleName);
            return Promise.resolve(true);
        }
        return this.buildModuleEngineClients(moduleName, enabledEngines);
    },

    /** Recursively initializes enabled engine clients for one module. */
    buildModuleEngineClients: function (moduleName, engineNames) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (engineNames && engineNames.length > 0) {
                    let engineName = engineNames.shift();
                    _self.buildEngineClient(moduleName, engineName).then(success => {
                        if (success.code === 'SUC_CACHE_00000') {
                            if (!_self.engineClients[moduleName]) {
                                _self.engineClients[moduleName] = {};
                            }
                            _self.engineClients[moduleName][engineName] = success.result;
                        }
                        _self.buildModuleEngineClients(moduleName, engineNames).then(success => {
                            resolve(success);
                        }).catch(error => reject(error));
                    }).catch(error => reject(error));
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(new CLASSES.CacheError(error));
            }
        });
    },

    /** Validates and starts one enabled engine client; enabled infrastructure failures fail startup. */
    buildEngineClient: function (moduleName, engineName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let engineOptions = SERVICE.DefaultCacheConfigurationService.getCacheEngine(moduleName, engineName);
                engineOptions.capabilities = _self.validateEngineContract(engineName, engineOptions, engineName);
                engineOptions.options = engineOptions.options || {};
                engineOptions.options.prefix = moduleName;
                SERVICE[engineOptions.connectionHandler].initCache(engineOptions, moduleName).then(value => {
                    resolve(value);
                }).catch(error => {
                    _self.log('error', 'Not able to initialize enabled cache engine for module: ' + moduleName + ', and engine: ' + engineName, error);
                    reject(new CLASSES.CacheError(error, 'Enabled cache engine failed to initialize for module: ' + moduleName + ', and engine: ' + engineName));
                });
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

    /** Validates and initializes one cache channel against an already-started enabled engine. */
    buildChannelCacheEngine: function (moduleName, channelName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let channelObj = SERVICE.DefaultCacheConfigurationService.getCacheChannels(moduleName)[channelName];
                if (channelObj.enabled === false) {
                    resolve({ code: 'SUC_CACHE_00001', message: 'Cache channel disabled for module: ' + moduleName + ', and channel: ' + channelName });
                    return;
                }
                if (channelObj.enabled && channelObj.engine) {
                    let engineOptions = SERVICE.DefaultCacheConfigurationService.getCacheEngine(moduleName, channelObj.engine);
                    _self.validateEngineContract(channelObj.engine, engineOptions, channelName);
                    let engineClient = _self.getEngineClient(moduleName, channelObj.engine);
                    if (!engineClient) {
                        reject(new CLASSES.CacheError('ERR_CACHE_00008', 'Cache channel ' + channelName + ' requires disabled or uninitialized engine: ' + channelObj.engine));
                        return;
                    }
                    _self.registerEvents(engineOptions, moduleName, engineClient, channelObj);
                    resolve({
                        code: 'SUC_CACHE_00000',
                        result: {
                            chennalOptions: channelObj,
                            channelOptions: channelObj,
                            engineOptions: engineOptions,
                            client: engineClient,
                            channelName: channelName
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
        if (!engineOptions || engineOptions.enabled === false) {
            let reason = engineOptions && engineOptions.disabledReason || 'Adapter metadata is missing or disabled';
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
