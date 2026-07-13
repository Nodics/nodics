/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const NodeCache = require("node-cache");
const _ = require('lodash');

/**
 * @module gFramework/nCache/nodeCache/src/service/engine/defaultLocalCacheEngineService
 * @description Implements nCache default local cache engine service business behavior and extension logic.
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

     * @param {*} localCacheConfig Method input.

     * @param {*} moduleName Method input.

     * @returns {*} Method result.

     */

    initCache: function (localCacheConfig, moduleName) {
        return new Promise((resolve, reject) => {
            try {
                let client = new NodeCache(localCacheConfig.options);
                resolve({
                    code: 'SUC_CACHE_00000',
                    result: client
                });
            } catch (error) {
                reject(new CLASSES.CacheError(error, 'While creating NodeCache client'));
            }
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
        _.each(options.options.events, (trigger, event) => {
            let serviceName = trigger.substring(0, trigger.indexOf('.'));
            let functionName = trigger.substring(trigger.indexOf('.') + 1, trigger.length);
            options.publishClient.on(event, function (key, value) {
                if (key.startsWith('authToken_')) {
                    key = key.substring(10, key.length);
                }
                SERVICE[serviceName][functionName](key, value, {
                    moduleName: options.moduleName,
                    moduleObject: moduleObject
                });
            });
        });
    }
};