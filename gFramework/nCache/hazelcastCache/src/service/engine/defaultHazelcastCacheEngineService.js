/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCache/hazelcastCache/service/engine/DefaultHazelcastCacheEngineService
 * @description Fail-closed placeholder for Hazelcast connection handling; projects must provide a real layered adapter before enabling this engine.
 * @layer service
 * @owner nCache/hazelcastCache
 * @override A project may replace this service with a real Hazelcast client while declaring truthful capabilities and preserving the cache adapter contract.
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

    /** Rejects activation until a real distributed Hazelcast implementation overrides this service. */
    initCache: function (hazelcastCacheConfig, moduleName) {
        return Promise.reject(new CLASSES.CacheError('ERR_CACHE_00008', 'Bundled Hazelcast adapter is unsupported for module: ' + moduleName));
    },

    /** Rejects schema-channel activation for the unsupported placeholder. */
    schema: function (hazelcastCacheConfig, moduleName) {
        return this.initCache(hazelcastCacheConfig, moduleName);
    },

    /** Rejects router-channel activation for the unsupported placeholder. */
    router: function (hazelcastCacheConfig, moduleName) {
        return this.initCache(hazelcastCacheConfig, moduleName);
    },

    /** Rejects event registration because no Hazelcast client is active. */
    registerEvents: function (options) {
        return Promise.reject(new CLASSES.CacheError('ERR_CACHE_00008', 'Bundled Hazelcast adapter does not support events'));
    }
};
