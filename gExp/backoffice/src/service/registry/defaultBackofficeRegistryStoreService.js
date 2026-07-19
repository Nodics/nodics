/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/registry/DefaultBackofficeRegistryStoreService
 * @description Provides the single asynchronous memory or nCache-owned distributed lease-store boundary used by BackOffice.
 * @layer service
 * @owner backoffice
 * @override Projects may replace store behavior while preserving asynchronous TTL, enumeration, diagnostics, and failure contracts.
 */
module.exports = {
    _instances: new Map(),
    _metrics: { reads: 0, writes: 0, deletes: 0, scans: 0, errors: 0, lastSuccessAt: null, lastErrorAt: null },

    /** Initializes the configured store without creating provider connections outside nCache. */
    init: function () { return Promise.resolve(true); },
    /** Completes the standard service post-initialization contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective store policy from the BackOffice registry configuration. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).store || { mode: 'memory' }; },
    /** Returns whether the effective store uses an nCache-owned distributed engine. */
    isDistributed: function () { return this.getConfiguration().mode === 'distributed'; },
    /** Builds one non-sensitive namespaced provider key. */
    getStorageKey: function (key) { return String(this.getConfiguration().keyPrefix || 'registry:lease:') + key; },
    /** Returns the configured distributed engine client already owned by nCache. */
    getDistributedClient: function () {
        let config = this.getConfiguration();
        let engineService = SERVICE.DefaultCacheEngineService;
        let client = engineService && engineService.getEngineClient(config.moduleName || 'backoffice', config.engineName || 'redis');
        if (!client) throw new Error('Configured BackOffice distributed registry store is unavailable');
        return client;
    },
    /** Records a sanitized store operation outcome. */
    observe: function (operation, executor) {
        return Promise.resolve().then(executor).then(result => {
            this._metrics[operation]++;
            this._metrics.lastSuccessAt = new Date().toISOString();
            return result;
        }).catch(error => {
            this._metrics.errors++;
            this._metrics.lastErrorAt = new Date().toISOString();
            throw error;
        });
    },
    /** Returns one observed lease by its stable module-instance key. */
    get: function (key) {
        return this.observe('reads', () => {
            if (!this.isDistributed()) return this._instances.get(key);
            return this.getDistributedClient().get(this.getStorageKey(key)).then(value => value ? JSON.parse(value) : undefined);
        });
    },
    /** Creates or replaces one observed lease with a bounded provider TTL. */
    set: function (key, value, ttlMs) {
        return this.observe('writes', () => {
            if (!this.isDistributed()) {
                this._instances.set(key, value);
                return value;
            }
            let duration = Math.max(1, Number(ttlMs || value.expiresAt - Date.now()));
            return this.getDistributedClient().set(this.getStorageKey(key), JSON.stringify(value), { PX: duration }).then(() => value);
        });
    },
    /** Removes one observed lease. */
    delete: function (key) {
        return this.observe('deletes', () => {
            if (!this.isDistributed()) return this._instances.delete(key);
            return this.getDistributedClient().del(this.getStorageKey(key)).then(count => count > 0);
        });
    },
    /** Returns a snapshot of every currently present observed lease. */
    values: function () {
        return this.observe('scans', async () => {
            if (!this.isDistributed()) return Array.from(this._instances.entries()).map(entry => ({ key: entry[0], value: entry[1] }));
            let client = this.getDistributedClient();
            let prefix = String(this.getConfiguration().keyPrefix || 'registry:lease:');
            let keys = [];
            for await (let key of client.scanIterator({ MATCH: prefix + '*', COUNT: 100 })) keys.push(key);
            if (keys.length === 0) return [];
            let values = typeof client.mGet === 'function' ? await client.mGet(keys) : await Promise.all(keys.map(key => client.get(key)));
            return keys.map((key, index) => values[index] ? {
                key: key.substring(prefix.length), value: JSON.parse(values[index])
            } : null).filter(Boolean);
        });
    },
    /** Returns the current observed lease count. */
    size: function () { return this.values().then(entries => entries.length); },
    /** Returns sanitized store mode, health, and operation counters. */
    diagnostics: function () {
        let config = this.getConfiguration();
        let available = true;
        if (this.isDistributed()) {
            try {
                let client = this.getDistributedClient();
                available = client.isReady === undefined || client.isReady === true;
            } catch (error) { available = false; }
        }
        return { mode: config.mode || 'memory', distributed: this.isDistributed(), available: available, metrics: Object.assign({}, this._metrics) };
    },
    /** Clears all process-local observed leases; intended for controlled shutdown and tests. */
    clear: function () { this._instances.clear(); }
};
