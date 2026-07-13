/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCache/cache/service/cache/DefaultCacheService
 * @description Routes cache operations and runtime cache-configuration changes through the layered engine and event contracts.
 * @layer service
 * @owner nCache/cache
 * @override Project modules may replace cache behavior while preserving tenant scope, operation envelopes, and engine dispatch contracts.
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
    /**
     * In-memory diagnostics counters for cache operations.
     *
     * @type {Object}
     */
    cacheMetrics: {
        startedAt: new Date().toISOString(),
        operations: {}
    },

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

    /** Stores a value through the configured module and channel cache engine. */
    put: function (options) {
        return this.observeCacheOperation('put', options, () => {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                this.assertWriteCapabilities(channel, options.ttl);
                let operationName = 'put';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Put'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Put'] === 'function') {
                    operationName = options.channelName + 'Put';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                return Promise.reject(new CLASSES.CacheError({
                    code: 'ERR_CACHE_00006',
                    message: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                }));
            }
        }, 'Error while putting value in cache');
    },

    /** Reads a value through the configured module and channel cache engine. */
    get: function (options) {
        return this.observeCacheOperation('get', options, () => {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                let operationName = 'get';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Get'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'Get'] === 'function') {
                    operationName = options.channelName + 'Get';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                return Promise.reject(new CLASSES.CacheError({
                    code: 'ERR_CACHE_00006',
                    message: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                }));
            }
        }, 'Error while getting value from cache');
    },

    /** Atomically removes and returns one cache value through the active engine. */
    consume: function (options) {
        return this.observeCacheOperation('consume', options, () => {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (!channel) {
                return Promise.reject(new CLASSES.CacheError('ERR_CACHE_00006', 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName));
            }
            let handler = SERVICE[channel.engineOptions.cacheHandler];
            this.assertCapability(channel, 'atomicConsume');
            let operationName = options.channelName + 'Consume';
            if (!handler[operationName] || typeof handler[operationName] !== 'function') operationName = 'consume';
            if (!handler[operationName] || typeof handler[operationName] !== 'function') {
                return Promise.reject(new CLASSES.CacheError('ERR_CACHE_00006', 'Cache engine does not support atomic consume for channel: ' + options.channelName));
            }
            options.channel = channel;
            return handler[operationName](options);
        }, 'Error while atomically consuming cache value');
    },

    /** Selects key-based or prefix-based invalidation from the supplied scope. */
    flushCache: function (options) {
        try {
            this.validateMutationScope(options);
            let flush;
            if (options.keys && options.keys instanceof Array && options.keys.length > 0) {
                flush = this.flushByKeys(options);
            } else {
                flush = this.flushByPrefix(options);
            }
            return Promise.resolve(flush).then(result => this.propagateInvalidation(options).then(() => result));
        } catch (error) {
            return Promise.reject(new CLASSES.CacheError(error));
        }
    },

    /** Invalidates values matching a prefix through the active cache engine. */
    flushByPrefix: function (options) {
        return this.observeCacheOperation('flushByPrefix', options, () => {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                this.assertCapability(channel, 'prefixFlush');
                let operationName = 'flushByPrefix';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByPrefix'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByPrefix'] === 'function') {
                    operationName = options.channelName + 'FlushByPrefix';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                return Promise.reject(new CLASSES.CacheError({
                    code: 'ERR_CACHE_00006',
                    message: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                }));
            }
        }, 'Error while flushing cache');
    },

    /** Invalidates explicit keys through the active cache engine. */
    flushByKeys: function (options) {
        return this.observeCacheOperation('flushByKeys', options, () => {
            let channel = SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
            if (channel) {
                this.assertCapability(channel, 'keyFlush');
                let operationName = 'flushByKeys';
                if (SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByKeys'] && typeof SERVICE[channel.engineOptions.cacheHandler][options.channelName + 'FlushByKeys'] === 'function') {
                    operationName = options.channelName + 'FlushByKeys';
                }
                options.channel = channel;
                return SERVICE[channel.engineOptions.cacheHandler][operationName](options);
            } else {
                return Promise.reject(new CLASSES.CacheError({
                    code: 'ERR_CACHE_00006',
                    message: 'Could not found cache client for channel: ' + options.channelName + ', within module: ' + options.moduleName
                }));
            }
        }, 'Error while flushing keys in cache');
    },

    /**
     * Wraps one cache operation with diagnostics recording without changing the adapter contract.
     *
     * @param {string} operation Cache operation name.
     * @param {Object} options Cache operation options.
     * @param {Function} executor Function that executes the underlying adapter operation.
     * @param {string} errorMessage Context message for synchronous operation failures.
     * @returns {Promise<*>} Original operation result.
     */
    observeCacheOperation: function (operation, options, executor, errorMessage) {
        let startedAt = Date.now();
        try {
            return Promise.resolve(executor()).then(success => {
                this.recordCacheMetric(operation, options, this.resolveMetricResult(operation, true), startedAt);
                return success;
            }).catch(error => {
                this.recordCacheMetric(operation, options, this.resolveMetricResult(operation, false, error), startedAt, error);
                throw error;
            });
        } catch (error) {
            this.recordCacheMetric(operation, options, this.resolveMetricResult(operation, false, error), startedAt, error);
            return Promise.reject(new CLASSES.CacheError(error, errorMessage));
        }
    },

    /**
     * Converts an operation outcome into a stable diagnostics result label.
     *
     * @param {string} operation Cache operation name.
     * @param {boolean} success Whether the operation succeeded.
     * @param {Error} error Optional operation error.
     * @returns {string} One of `hit`, `miss`, `success`, or `error`.
     */
    resolveMetricResult: function (operation, success, error) {
        if (success && (operation === 'get' || operation === 'consume')) return 'hit';
        if (!success && error && error.code === 'ERR_CACHE_00001' && (operation === 'get' || operation === 'consume')) return 'miss';
        return success ? 'success' : 'error';
    },

    /**
     * Returns effective cache diagnostics configuration.
     *
     * @returns {Object} Effective diagnostics options.
     */
    getCacheDiagnosticsOptions: function () {
        let defaults = { enabled: true, includeTenant: true };
        try {
            let cacheConfig = typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('cache') || {};
            return _.merge({}, defaults, cacheConfig.diagnostics || {});
        } catch (error) {
            return defaults;
        }
    },

    /**
     * Builds non-sensitive cache metrics dimensions from operation options.
     *
     * @param {string} operation Cache operation name.
     * @param {Object} options Cache operation options.
     * @param {Object} diagnosticsOptions Effective diagnostics options.
     * @returns {Object} Metrics dimensions.
     */
    buildCacheMetricDimensions: function (operation, options, diagnosticsOptions) {
        options = options || {};
        return {
            moduleName: options.moduleName || '<unknown>',
            tenant: diagnosticsOptions.includeTenant === false ? '<redacted>' : options.tenant || '<unknown>',
            channelName: options.channelName || options.channel && options.channel.channelName || '<unknown>',
            operation: operation,
            cacheLayer: options.cacheLayer || options.layer || options.cacheType || '<unknown>',
            resourceName: options.resourceName || options.prefix || '<unknown>',
            reasonCode: options.reasonCode || '<none>'
        };
    },

    /**
     * Records one cache operation metric in process memory.
     *
     * @param {string} operation Cache operation name.
     * @param {Object} options Cache operation options.
     * @param {string} result Stable result label.
     * @param {number} startedAt Epoch milliseconds when the operation started.
     * @param {Error} error Optional operation error.
     * @returns {boolean} Always true when diagnostics are disabled or recorded.
     */
    recordCacheMetric: function (operation, options, result, startedAt, error) {
        let diagnosticsOptions = this.getCacheDiagnosticsOptions();
        if (diagnosticsOptions.enabled === false) return true;
        let dimensions = this.buildCacheMetricDimensions(operation, options, diagnosticsOptions);
        let key = [dimensions.moduleName, dimensions.tenant, dimensions.channelName, dimensions.operation].join('|');
        let elapsedMs = Math.max(0, Date.now() - startedAt);
        let existing = this.cacheMetrics.operations[key] || {
            moduleName: dimensions.moduleName,
            tenant: dimensions.tenant,
            channelName: dimensions.channelName,
            operation: dimensions.operation,
            count: 0,
            results: {},
            reasonCodes: {},
            resources: {},
            layers: {},
            totalLatencyMs: 0,
            maxLatencyMs: 0,
            lastLatencyMs: 0,
            lastResult: null,
            lastErrorCode: null,
            lastReasonCode: null,
            lastResourceName: null,
            lastCacheLayer: null,
            updatedAt: null
        };
        existing.count += 1;
        existing.results[result] = (existing.results[result] || 0) + 1;
        if (dimensions.reasonCode !== '<none>') {
            existing.reasonCodes[dimensions.reasonCode] = (existing.reasonCodes[dimensions.reasonCode] || 0) + 1;
        }
        if (dimensions.resourceName !== '<unknown>') {
            existing.resources[dimensions.resourceName] = (existing.resources[dimensions.resourceName] || 0) + 1;
        }
        if (dimensions.cacheLayer !== '<unknown>') {
            existing.layers[dimensions.cacheLayer] = (existing.layers[dimensions.cacheLayer] || 0) + 1;
        }
        existing.totalLatencyMs += elapsedMs;
        existing.maxLatencyMs = Math.max(existing.maxLatencyMs, elapsedMs);
        existing.lastLatencyMs = elapsedMs;
        existing.lastResult = result;
        existing.lastErrorCode = error && error.code || null;
        existing.lastReasonCode = dimensions.reasonCode !== '<none>' ? dimensions.reasonCode : null;
        existing.lastResourceName = dimensions.resourceName !== '<unknown>' ? dimensions.resourceName : null;
        existing.lastCacheLayer = dimensions.cacheLayer !== '<unknown>' ? dimensions.cacheLayer : null;
        existing.updatedAt = new Date().toISOString();
        this.cacheMetrics.operations[key] = existing;
        return true;
    },

    /**
     * Records one cacheability policy decision without exposing payload data.
     *
     * @param {Object} decision Cacheability decision.
     * @param {Object} context Policy context.
     * @returns {boolean} True when diagnostics are disabled or recorded.
     */
    recordPolicyDecision: function (decision, context) {
        decision = decision || {};
        context = context || {};
        this.recordCacheMetric('policyDecision', {
            tenant: context.tenant,
            moduleName: context.moduleName,
            channelName: context.channelName || decision.layer || context.layer,
            cacheLayer: context.layer || decision.layer,
            reasonCode: decision.reasonCode
        }, decision.cacheable === false ? 'skipped' : 'accepted', Date.now());
        return true;
    },

    /**
     * Returns a detached snapshot of cache diagnostics counters.
     *
     * @param {Object} filter Optional moduleName, tenant, channelName, operation, cacheLayer, reasonCode, or resourceName filter.
     * @returns {Object} Metrics snapshot.
     */
    getCacheMetricsSnapshot: function (filter) {
        filter = filter || {};
        let snapshot = _.cloneDeep(this.cacheMetrics);
        snapshot.operations = Object.keys(snapshot.operations).reduce((result, key) => {
            let item = snapshot.operations[key];
            if (filter.moduleName && item.moduleName !== filter.moduleName) return result;
            if (filter.tenant && item.tenant !== filter.tenant) return result;
            if (filter.channelName && item.channelName !== filter.channelName) return result;
            if (filter.operation && item.operation !== filter.operation) return result;
            if (filter.cacheLayer && !(item.layers && item.layers[filter.cacheLayer])) return result;
            if (filter.reasonCode && !(item.reasonCodes && item.reasonCodes[filter.reasonCode])) return result;
            if (filter.resourceName && !(item.resources && item.resources[filter.resourceName])) return result;
            result[key] = item;
            return result;
        }, {});
        return snapshot;
    },

    /**
     * Clears process-local cache diagnostics counters.
     *
     * @returns {Object} Reset metrics snapshot.
     */
    resetCacheMetrics: function () {
        this.cacheMetrics = {
            startedAt: new Date().toISOString(),
            operations: {}
        };
        return this.getCacheMetricsSnapshot();
    },

    /** Resolves the layered search-cache channel for a schema. */
    getSearchCacheChannel: function (schemaName) {
        let channelName = 'search';
        if (CONFIG.get('cache').schemaCacheChannelNameMapping && CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName]) {
            channelName = CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName];
        }
        return channelName;
    },

    /** Resolves the layered item-cache channel for a schema. */
    getSchemaCacheChannel: function (schemaName) {
        let channelName = 'schema';
        if (CONFIG.get('cache').schemaCacheChannelNameMapping && CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName]) {
            channelName = CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName];
        }
        return channelName;
    },

    /** Resolves the layered API-cache channel for a router. */
    getRouterCacheChannel: function (routerName) {
        let channelName = 'router';
        if (CONFIG.get('cache').routerCacheChannelNameMapping && CONFIG.get('cache').routerCacheChannelNameMapping[routerName]) {
            channelName = CONFIG.get('cache').routerCacheChannelNameMapping[routerName];
        }
        return channelName;
    },

    /** Resolves the layered authentication-cache channel for a tenant. */
    getAuthCacheChannel: function (tenant) {
        let channelName = 'auth';
        if (CONFIG.get('cache').authCacheChannelNameMapping && CONFIG.get('cache').authCacheChannelNameMapping[tenant]) {
            channelName = CONFIG.get('cache').authCacheChannelNameMapping[tenant];
        }
        return channelName;
    },

    /** Returns normalized capabilities for initialized and legacy custom adapters. */
    getChannelCapabilities: function (channel) {
        let engineOptions = channel && channel.engineOptions || {};
        return Object.assign({
            distributed: engineOptions.distributed === true,
            atomicConsume: engineOptions.atomicConsume === true,
            ttl: true,
            nonExpiringTtl: true,
            prefixFlush: true,
            keyFlush: true,
            serialization: 'custom'
        }, engineOptions.capabilities || {});
    },

    /** Fails when an operation requires a capability the selected adapter did not declare. */
    assertCapability: function (channel, capability) {
        if (this.getChannelCapabilities(channel)[capability] !== true) {
            throw new CLASSES.CacheError('ERR_CACHE_00009', 'Cache adapter does not support required capability: ' + capability);
        }
        return true;
    },

    /** Enforces declared TTL and explicit non-expiring write capabilities. */
    assertWriteCapabilities: function (channel, ttl) {
        if (ttl !== undefined) this.assertCapability(channel, 'ttl');
        if (ttl === 0) this.assertCapability(channel, 'nonExpiringTtl');
        return true;
    },

    /** Resolves a cache purpose through layered channel mappings. */
    resolveCacheChannel: function (cacheType, resourceName, tenant) {
        if (cacheType === 'router') return this.getRouterCacheChannel(resourceName);
        if (cacheType === 'schema') return this.getSchemaCacheChannel(resourceName);
        if (cacheType === 'search') return this.getSearchCacheChannel(resourceName);
        if (cacheType === 'auth') return this.getAuthCacheChannel(tenant);
        throw new CLASSES.CacheError('ERR_CACHE_00009', 'Unknown cache purpose: ' + cacheType);
    },

    /** Resolves every active channel that may contain a resource, including customized router-channel mappings. */
    resolveInvalidationChannels: function (options) {
        if (options.cacheType !== 'router') {
            return [this.resolveCacheChannel(options.cacheType, options.resourceName, options.tenant)];
        }
        let cacheConfig = CONFIG.get('cache') || {};
        let candidates = ['router'].concat(Object.values(cacheConfig.routerCacheChannelNameMapping || {}));
        let configured = SERVICE.DefaultCacheConfigurationService.getCacheChannels(options.moduleName) || {};
        let unique = Array.from(new Set(candidates));
        let active = unique.filter(channelName => configured[channelName]);
        return active.length > 0 ? active : [this.getRouterCacheChannel(options.resourceName)];
    },

    /** Invalidates one tenant-owned logical resource using the effective layered channel mapping. */
    invalidateResource: function (options) {
        options = Object.assign({}, options || {});
        if (!options.resourceName || !options.cacheType) {
            return Promise.reject(new CLASSES.CacheError('ERR_CACHE_00009', 'resourceName and cacheType are required for cache invalidation'));
        }
        let channels = this.resolveInvalidationChannels(options);
        let startedAt = Date.now();
        return Promise.all(channels.map(channelName => this.flushCache(Object.assign({}, options, {
            channelName: channelName,
            prefix: options.resourceName,
            internalCacheOperation: true
        })))).then(success => {
            this.recordCacheMetric('invalidateResource', Object.assign({}, options, {
                channelName: channels.join(','),
                cacheLayer: options.cacheType
            }), 'success', startedAt);
            return success;
        }).catch(error => {
            this.recordCacheMetric('invalidateResource', Object.assign({}, options, {
                channelName: channels.join(','),
                cacheLayer: options.cacheType
            }), 'error', startedAt, error);
            throw error;
        });
    },

    /** Broadcasts local-adapter invalidation to peer module nodes; shared adapters need no duplicate event. */
    propagateInvalidation: function (options) {
        let channel = options.channel || SERVICE.DefaultCacheEngineService.getCacheEngine(options.moduleName, options.channelName);
        let cacheConfig = CONFIG.get('cache') || {};
        let policy = cacheConfig.invalidation || {};
        if (options.suppressPropagation === true || policy.crossNode === false || this.getChannelCapabilities(channel).distributed === true) {
            return Promise.resolve(true);
        }
        if (!SERVICE.DefaultEventService || typeof SERVICE.DefaultEventService.publish !== 'function') {
            return Promise.reject(new CLASSES.CacheError('ERR_CACHE_00009', 'Cross-node invalidation requires the configured event service'));
        }
        return SERVICE.DefaultEventService.publish({
            tenant: options.tenant,
            active: true,
            event: policy.eventName || 'cacheInvalidation',
            sourceName: options.moduleName,
            sourceId: CONFIG.get('nodeId'),
            target: options.moduleName,
            state: 'NEW',
            type: 'SYNC',
            targetType: ENUMS.TargetType.MODULE_NODES.key,
            data: {
                channelName: options.channelName,
                prefix: options.prefix,
                keys: options.keys
            }
        });
    },


    /** Publishes a governed runtime API-cache configuration update. */
    updateRouterCacheConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            try {
                this.validateMutationScope(request);
                this.publishCacheChangeEvent(request, 'apiCacheChange').then(success => {
                    resolve({
                        code: 'SUC_CACHE_00000',
                        result: success
                    });
                }).catch(error => {
                    reject(new CLASSES.CacheError(error, 'Facing issue while updating router cache'));
                });
            } catch (error) {
                reject(new CLASSES.CacheError(error, 'Facing issue while updating router cache'));
            }
        });
    },

    /** Publishes a governed runtime item-cache configuration update. */
    updateItemCacheConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            try {
                this.validateMutationScope(request);
                this.publishCacheChangeEvent(request, 'itemCacheChange').then(success => {
                    resolve({
                        code: 'SUC_CACHE_00000',
                        result: success
                    });
                }).catch(error => {
                    reject(new CLASSES.CacheError(error, 'Facing issue while updating item cache'));
                });
            } catch (error) {
                reject(new CLASSES.CacheError(error, 'Facing issue while updating item cache'));
            }
        });
    },

    /** Backward-compatible public schema-cache configuration operation. */
    updateSchemaCacheConfiguration: function (request) {
        return this.updateItemCacheConfiguration(request);
    },

    /** Rejects cache mutations that escape the authorized tenant or active route module. */
    validateMutationScope: function (request) {
        request = request || {};
        let authData = request.authData || {};
        let authorizedTenant = authData.tenant || authData.enterprise && authData.enterprise.tenant && authData.enterprise.tenant.code;
        let body = request.httpRequest && request.httpRequest.body;
        let config = request.config;
        let moduleName = request.moduleName;
        let tenant = request.tenant;
        let bodyModule = body && !Array.isArray(body) && (body.moduleName || body.targetModule || body.targetModuleName) || config && (config.moduleName || config.targetModule || config.targetModuleName);
        let bodyTenant = body && !Array.isArray(body) && body.tenant || config && config.tenant;
        let modules = typeof NODICS !== 'undefined' && typeof NODICS.getModules === 'function' ? NODICS.getModules() : undefined;
        let activeModule = typeof NODICS !== 'undefined' && typeof NODICS.getModule === 'function' ? NODICS.getModule(moduleName) : modules && modules[moduleName];
        let activeTenants = typeof NODICS !== 'undefined' && typeof NODICS.getActiveTenants === 'function' ? NODICS.getActiveTenants() : undefined;
        let internalOperation = request.internalCacheOperation === true;
        if (!moduleName || (!tenant && !internalOperation) || authorizedTenant && authorizedTenant !== tenant || bodyTenant && bodyTenant !== tenant || bodyModule && bodyModule !== moduleName || (activeModule === undefined && (modules || typeof NODICS !== 'undefined' && typeof NODICS.getModule === 'function')) || tenant && Array.isArray(activeTenants) && activeTenants.length > 0 && !activeTenants.includes(tenant)) {
            throw new CLASSES.CacheError('ERR_CACHE_00007', 'Cache mutation must remain within authorized tenant ' + (tenant || '<missing>') + ' and active module ' + (moduleName || '<missing>'));
        }
        return true;
    },


    /** Broadcasts a tenant-aware cache configuration change to active module nodes. */
    publishCacheChangeEvent: function (request, eventName) {
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultEventService.publish({
                    tenant: request.tenant,
                    active: true,
                    event: eventName,
                    sourceName: request.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: request.moduleName,
                    state: "NEW",
                    type: 'SYNC',
                    targetType: ENUMS.TargetType.MODULE_NODES.key,
                    data: request.config
                }).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.CacheError(error, 'Facing issue while publishing update cache event'));
            }
        });
    },


    /** Applies an API-cache configuration event to the effective router definition. */
    handleRouterCacheChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (UTILS.isBlank(request.config)) {
                    reject(new CLASSES.CacheError('ERR_CACHE_00002'));
                } else if (!request.config.routerName) {
                    reject(new CLASSES.CacheError('ERR_CACHE_00003'));
                } else {
                    let key = request.moduleName;
                    if (request.config.schemaName) {
                        key = key + '_' + request.config.schemaName;
                    }
                    key = key + '_' + request.config.routerName;
                    let routerDefinition = NODICS.getRouter(key.toLowerCase(), request.moduleName);
                    if (routerDefinition) {
                        routerDefinition.cache = _.merge(routerDefinition.cache || {}, request.config.cache);
                        resolve({
                            code: 'SUC_CACHE_00000'
                        });
                    } else {
                        let msg = 'Could not found router definition for router name: ' + request.config.routerName;
                        if (request.config.schemaName) {
                            msg = msg + ' and schemaName: ' + request.config.schemaName;
                        }
                        reject(new CLASSES.CacheError('ERR_CACHE_00005', msg));
                    }
                }
            } catch (error) {
                reject(new CLASSES.CacheError(error, 'Facing issue while updating router cache'));
            }
        });
    },

    /** Applies an item-cache configuration event to every active tenant model. */
    handleItemCacheChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (UTILS.isBlank(request.config)) {
                    reject(new CLASSES.CacheError('ERR_CACHE_00002'));
                } else if (!request.config.schemaName) {
                    reject(new CLASSES.CacheError('ERR_CACHE_00004'));
                } else {
                    let modelName = UTILS.createModelName(request.config.schemaName);
                    try {
                        NODICS.getActiveTenants().forEach(tntName => {
                            let model = NODICS.getModels(request.moduleName, tntName)[modelName];
                            if (model) {
                                model.cache = _.merge(model.cache || {}, request.config.cache || {});
                            } else {
                                throw new Error('Invalid schemaName: ' + request.config.schemaName + ' to update item cache');
                            }
                        });
                    } catch (error) {
                        reject(new CLASSES.CacheError(error));
                        return;
                    }
                    resolve({ code: 'SUC_CACHE_00000' });
                }
            } catch (error) {
                reject(new CLASSES.CacheError(error, 'Facing issue while updating item cache'));
            }
        });
    },
};
