/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    put: function (options) {
        try {
            let key = this.getKey(options);
            let ttl = this.getTtl(options);
            this.LOG.debug('Putting value in Redis cache storage with key: ' + key + ' TTL: ' + ttl);
            let write = ttl > 0 ? options.channel.client.set(key, JSON.stringify(options.value), { EX: ttl }) : options.channel.client.set(key, JSON.stringify(options.value));
            return Promise.resolve(write).then(() => Object.assign({}, options.value, { code: 'SUC_CACHE_00000' })).catch(error => { throw new CLASSES.CacheError(error); });
        } catch (error) {
            return Promise.reject(new CLASSES.CacheError(error));
        }
    },

    get: function (options) {
        try {
            let key = this.getKey(options);
            this.LOG.debug('Getting value from Redis cache storage with key: ' + key);
            return Promise.resolve(options.channel.client.get(key)).then(value => {
                if (!value) throw new CLASSES.CacheError('ERR_CACHE_00001', 'Could not find any value for key: ' + key);
                return Object.assign(typeof value === 'string' ? JSON.parse(value) : value, { code: 'SUC_CACHE_00000' });
            }).catch(error => { throw error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error); });
        } catch (error) {
            return Promise.reject(new CLASSES.CacheError(error));
        }
    },

    /** Atomically reads and deletes one value using Redis GETDEL. */
    consume: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let key = this.getKey(options);
                if (typeof options.channel.client.getDel !== 'function') {
                    reject(new CLASSES.CacheError('ERR_CACHE_00006', 'Redis client does not support atomic GETDEL'));
                    return;
                }
                Promise.resolve(options.channel.client.getDel(key)).then(value => {
                    if (!value) throw new CLASSES.CacheError('ERR_CACHE_00001', 'Could not find any value for key: ' + key);
                    value = typeof value === 'string' ? JSON.parse(value) : value;
                    value.code = 'SUC_CACHE_00000';
                    resolve(value);
                }).catch(error => reject(error instanceof CLASSES.CacheError ? error : new CLASSES.CacheError(error)));
            } catch (error) {
                reject(new CLASSES.CacheError(error));
            }
        });
    },

    flushByPrefix: function (options) {
        try {
            let prefix = options.channel.channelName + '_' + options.channel.engineOptions.options.prefix + '_' + (options.prefix || '');
            let pattern = prefix.endsWith('*') ? prefix : prefix + '*';
            return this.collectKeys(options.channel.client, pattern).then(keys => {
                let removal = keys.length > 0 ? options.channel.client.del(keys) : Promise.resolve(0);
                return Promise.resolve(removal).then(() => ({ code: 'SUC_CACHE_00000', result: keys }));
            }).catch(error => { throw new CLASSES.CacheError(error); });
        } catch (error) {
            return Promise.reject(new CLASSES.CacheError(error));
        }
    },

    flushByKeys: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let _self = this;
                let tmpKeys = [];
                if (options.keys && options.keys.length > 0) {
                    for (var i = 0; i < options.keys.length; i++) {
                        tmpKeys[i] = options.channel.channelName + '_' + options.channel.engineOptions.options.prefix + '_' + options.keys[i];
                    }
                }
                _self.LOG.debug('Flushing value in local cache stored with keys: ' + tmpKeys);
                Promise.resolve(tmpKeys.length > 0 ? options.channel.client.del(tmpKeys) : 0).then(() => resolve({
                    code: 'SUC_CACHE_00000',
                    result: tmpKeys
                })).catch(error => reject(new CLASSES.CacheError(error)));
            } catch (error) {
                reject(new CLASSES.CacheError(error));
            }
        });
    },

    /** Builds the canonical cache key shared by all Redis operations. */
    getKey: function (options) {
        return options.channel.channelName + '_' + options.channel.engineOptions.options.prefix + '_' + options.key;
    },

    /** Resolves the effective TTL while preserving explicit non-expiring values. */
    getTtl: function (options) {
        if (options.ttl === 0) return 0;
        return Number(options.ttl || options.channel.chennalOptions && options.channel.chennalOptions.ttl || options.channel.engineOptions.ttl || options.channel.engineOptions.options.ttl || 0);
    },

    /** Uses incremental SCAN so prefix cleanup does not block a shared Redis server. */
    collectKeys: async function (client, pattern) {
        let keys = [];
        for await (let key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) keys.push(key);
        return keys;
    }
};
