/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCache/hazelcastCache/service/cache/DefaultHazelcastCacheService
 * @description Fail-closed placeholder for Hazelcast cache operations; it never masquerades as local or distributed storage.
 * @layer service
 * @owner nCache/hazelcastCache
 * @override A project may replace this service with a real Hazelcast adapter that satisfies every declared capability.
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

    /** Rejects writes through the unsupported placeholder. */
    put: function (options) {
        return this.unsupported('put');
    },

    /** Rejects reads through the unsupported placeholder. */
    get: function (options) {
        return this.unsupported('get');
    },

    /** Rejects consume through the unsupported placeholder. */
    consume: function (options) {
        return this.unsupported('consume');
    },

    /** Rejects prefix invalidation through the unsupported placeholder. */
    flushByPrefix: function (options) {
        return this.unsupported('flushByPrefix');
    },

    /** Rejects key invalidation through the unsupported placeholder. */
    flushByKeys: function (options) {
        return this.unsupported('flushByKeys');
    },

    /** Creates the standard fail-closed rejection for placeholder operations. */
    unsupported: function (operation) {
        return Promise.reject(new CLASSES.CacheError('ERR_CACHE_00008', 'Bundled Hazelcast adapter does not support operation: ' + operation));
    }
};
