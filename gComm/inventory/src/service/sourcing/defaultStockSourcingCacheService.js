/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');

/**
 * @module inventory/service/sourcing/DefaultStockSourcingCacheService
 * @description Caches sourcing evaluation results through provider-neutral nCache and performs governed cross-node invalidation.
 * @layer service
 * @owner inventory
 * @override Projects may select local, Redis, or a compliant Hazelcast provider through cache configuration without replacing Inventory.
 */
module.exports = {
    /** Initializes the sourcing cache adapter. */ init: function () { return Promise.resolve(true); },
    /** Completes sourcing cache initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective Inventory sourcing cache policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockSourcingCache) || {}; },
    /** Deterministically serializes cache-key material without relying on object insertion order. */
    stableStringify: function (value) {
        if (Array.isArray(value)) return '[' + value.map(item => this.stableStringify(item)).join(',') + ']';
        if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + this.stableStringify(value[key])).join(',') + '}';
        return JSON.stringify(value);
    },
    /** Creates a bounded opaque key scoped by enterprise and normalized sourcing context. */
    buildKey: function (enterpriseCode, context) {
        let policy = this.policy(); let material = this.stableStringify({ enterpriseCode: enterpriseCode, context: context || {} });
        let key = String(policy.keyPrefix || 'stockSourcing:') + crypto.createHash('sha256').update(material).digest('hex');
        if (key.length > Number(policy.maximumKeyLength || 256)) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00027', 'Sourcing cache key exceeds configured boundary');
        return key;
    },
    /** Resolves a TTL that cannot cross the next Policy or Rule effective-date boundary. */
    resolveTtl: function (result) {
        let ttl = Number(this.policy().ttlSeconds || 30);
        if (!Number.isFinite(ttl) || ttl <= 0) return 0;
        if (result.nextEffectiveAt) {
            let boundaryTtl = Math.floor((new Date(result.nextEffectiveAt).getTime() - Date.now()) / 1000);
            if (boundaryTtl <= 0) return 0;
            ttl = Math.min(ttl, boundaryTtl);
        }
        return ttl;
    },
    /** Returns common nCache operation options with tenant and logical-resource dimensions. */
    options: function (request, key) {
        let policy = this.policy();
        return { tenant: request.tenant, authData: request.authData, moduleName: policy.moduleName || 'inventory',
            channelName: policy.channelName || 'sourcing', key: key, cacheLayer: 'sourcing', resourceName: policy.keyPrefix || 'stockSourcing:' };
    },
    /** Evaluates directly when disabled, on explicit historical time, cache miss, or provider failure. */
    evaluate: async function (request) {
        let policy = this.policy(); let enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        if (policy.enabled === false || request.at && policy.cacheExplicitEvaluationTime !== true || !SERVICE.DefaultCacheService) {
            return SERVICE.DefaultStockSourcingEvaluationService.evaluate(request);
        }
        let key = this.buildKey(enterpriseCode, request.context); let options = this.options(request, key);
        try { return await SERVICE.DefaultCacheService.get(options); } catch (error) {
            let result = await SERVICE.DefaultStockSourcingEvaluationService.evaluate(request); let ttl = this.resolveTtl(result);
            if (ttl > 0) await SERVICE.DefaultCacheService.put(Object.assign({}, options, { value: result, ttl: ttl })).catch(() => false);
            return result;
        }
    },
    /** Invalidates every tenant-local sourcing result and uses nCache peer propagation for local providers. */
    invalidate: function (request) {
        let policy = this.policy(); if (policy.enabled === false || !SERVICE.DefaultCacheService) return Promise.resolve(true);
        return SERVICE.DefaultCacheService.flushCache({ tenant: request.tenant, authData: request.authData,
            moduleName: policy.moduleName || 'inventory', channelName: policy.channelName || 'sourcing',
            prefix: policy.keyPrefix || 'stockSourcing:', cacheLayer: 'sourcing', resourceName: 'stockSourcing', internalCacheOperation: true });
    }
};
