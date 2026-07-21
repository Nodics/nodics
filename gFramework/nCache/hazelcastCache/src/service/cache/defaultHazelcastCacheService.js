/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCache/hazelcastCache/service/cache/DefaultHazelcastCacheService
 * @description Implements the nCache adapter contract with Hazelcast distributed maps, JSON serialization, TTL, and governed invalidation.
 * @layer service
 * @owner nCache/hazelcastCache
 * @override Projects may replace map naming or serialization while preserving tenant keys, TTL, detached values, and invalidation semantics.
 */
module.exports = {
    /** Initializes the adapter. */ init: function () { return Promise.resolve(true); },
    /** Completes adapter initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns a deterministic cluster map name for one module and channel. */
    mapName: function (options) {
        let engineOptions = options.channel && options.channel.engineOptions || {}; let prefix = engineOptions.options && engineOptions.options.mapNamePrefix || 'nodics';
        return [prefix, options.moduleName || 'default', options.channel.channelName || options.channelName || 'cache'].join('_').replace(/[^A-Za-z0-9_.-]/g, '_');
    },
    /** Resolves the distributed map proxy. */ map: function (options) { return options.channel.client.getMap(this.mapName(options)); },
    /** Stores a JSON value using the effective nCache TTL. */
    put: async function (options) {
        try {
            let map = await this.map(options); let key = SERVICE.DefaultCacheConfigurationService.createStorageKey(options);
            let ttl = SERVICE.DefaultCacheConfigurationService.resolveTtl(options); let value = JSON.stringify(options.value);
            await map.set(key, value, ttl > 0 ? ttl * 1000 : 0); return { code: 'SUC_CACHE_00000', result: JSON.parse(value) };
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Reads and deserializes a detached value or returns the standard miss error. */
    get: async function (options) {
        try {
            let map = await this.map(options); let key = SERVICE.DefaultCacheConfigurationService.createStorageKey(options); let value = await map.get(key);
            if (value === null || value === undefined) throw new CLASSES.CacheError('ERR_CACHE_00001', 'Could not find Hazelcast value for key: ' + key);
            return typeof value === 'string' ? JSON.parse(value) : JSON.parse(JSON.stringify(value));
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Atomically removes and returns one value. */
    consume: async function (options) {
        try {
            let map = await this.map(options); let key = SERVICE.DefaultCacheConfigurationService.createStorageKey(options); let value = await map.remove(key);
            if (value === null || value === undefined) throw new CLASSES.CacheError('ERR_CACHE_00001', 'Could not consume Hazelcast value for key: ' + key);
            return typeof value === 'string' ? JSON.parse(value) : JSON.parse(JSON.stringify(value));
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Removes every tenant-partitioned key matching the governed logical prefix. */
    flushByPrefix: async function (options) {
        try {
            let map = await this.map(options); let prefix = SERVICE.DefaultCacheConfigurationService.createStoragePrefix(options) + (options.prefix || '');
            let keys = (await map.keySet()).filter(key => String(key).startsWith(prefix));
            await Promise.all(keys.map(key => map.delete(key))); return { code: 'SUC_CACHE_00000', result: keys };
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    },
    /** Removes explicit tenant-partitioned keys. */
    flushByKeys: async function (options) {
        try {
            let map = await this.map(options); let keys = (options.keys || []).map(key => SERVICE.DefaultCacheConfigurationService.createStorageKey(options, key));
            await Promise.all(keys.map(key => map.delete(key))); return { code: 'SUC_CACHE_00000', result: keys };
        } catch (error) { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); }
    }
};
