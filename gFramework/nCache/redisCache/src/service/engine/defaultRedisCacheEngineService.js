/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const redis = require("redis");

/**
 * @module gFramework/nCache/redisCache/src/service/engine/defaultRedisCacheEngineService
 * @description Implements nCache default redis cache engine service business behavior and extension logic.
 * @layer service
 * @owner nCache
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
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

    /**

     * Initializes cache behavior for the module runtime.

     *

     * @param {*} redisCacheConfig Method input.

     * @param {*} moduleName Method input.

     * @returns {*} Method result.

     */

    initCache: function (redisCacheConfig, moduleName) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.LOG.info('Initializing Redis cache instance for module: ' + moduleName);
            let source = Object.assign({}, redisCacheConfig.options || {});
            let clientOptions = {};
            if (source.url) clientOptions.url = source.url;
            if (source.host || source.port || source.tls) {
                clientOptions.socket = Object.assign({}, source.socket || {}, {
                    host: source.host || source.socket && source.socket.host || '127.0.0.1',
                    port: Number(source.port || source.socket && source.socket.port || 6379)
                });
                if (source.tls) clientOptions.socket.tls = true;
            } else if (source.socket) {
                clientOptions.socket = source.socket;
            }
            clientOptions.database = Number(source.database !== undefined ? source.database : source.db || 0);
            ['username', 'password', 'name'].forEach(property => {
                if (source[property] !== undefined) clientOptions[property] = source[property];
            });
            let client = redis.createClient(clientOptions);
            let settled = false;
            client.on('error', error => {
                _self.LOG.error('Redis cache client error for module: ' + moduleName, error);
                if (!settled) {
                    settled = true;
                    reject(new CLASSES.CacheError(error, 'While creating Redis cache client'));
                }
            });
            client.connect().then(() => {
                if (!settled) {
                    settled = true;
                    _self.LOG.debug('Redis cache client is ready for module: ' + moduleName);
                    resolve({ code: 'SUC_CACHE_00000', result: client });
                }
            }).catch(error => {
                if (!settled) {
                    settled = true;
                    reject(new CLASSES.CacheError(error, 'While connecting Redis cache client'));
                }
            });
        });
    },

    /**

     * Executes schema behavior.

     *

     * @param {*} localCacheConfig Method input.

     * @param {*} moduleName Method input.

     * @returns {*} Method result.

     */

    schema: function (localCacheConfig, moduleName) {
        let moduleObject = NODICS.getModule(moduleName);
        if (moduleObject && !UTILS.isBlank(moduleObject.rawSchema)) {
            return this.initCache(localCacheConfig, moduleName);
        } else {
            return Promise.resolve({
                code: 'SUC_CACHE_00001',
                message: 'None schema found for module: ' + moduleName
            });
        }
    },

    /**

     * Executes router behavior.

     *

     * @param {*} localCacheConfig Method input.

     * @param {*} moduleName Method input.

     * @returns {*} Method result.

     */

    router: function (localCacheConfig, moduleName) {
        if (UTILS.isRouterEnabled(moduleName)) {
            return this.initCache(localCacheConfig, moduleName);
        } else {
            return Promise.resolve({
                code: 'SUC_CACHE_00001',
                message: 'Router is not enabled for module: ' + moduleName
            });
        }
    },

    /**

     * Updates events information.

     *

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    registerEvents: function (options) {
        let moduleObject = NODICS.getModule(options.moduleName);
        let database = Number(options.cacheOptions.database !== undefined ? options.cacheOptions.database : options.cacheOptions.db || 0);
        return options.publishClient.configSet('notify-keyspace-events', 'Ex').then(() => {
            let subscriber = options.publishClient.duplicate();
            return subscriber.connect().then(() => Promise.all(Object.keys(options.options.events || {}).map(event => {
                let trigger = options.options.events[event];
                let serviceName = trigger.substring(0, trigger.indexOf('.'));
                let functionName = trigger.substring(trigger.indexOf('.') + 1);
                return subscriber.subscribe('__keyevent@' + database + '__:' + event, key => {
                    if (key.startsWith('authToken_')) key = key.substring(10);
                    SERVICE[serviceName][functionName](key, null, {
                        moduleName: options.moduleName,
                        moduleObject: moduleObject
                    });
                });
            }))).then(() => subscriber);
        });
    }
};
