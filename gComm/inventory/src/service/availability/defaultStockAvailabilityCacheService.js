/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const crypto = require('crypto');
/** @module inventory/service/availability/DefaultStockAvailabilityCacheService @description Caches computed Availability through nCache and validates Balance revisions before serving a hit. @layer service @owner inventory */
module.exports = {
    /** Initializes the cache adapter. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns layered Availability cache policy. */ policy: function () { return ((CONFIG.get('inventory') || {}).stockAvailabilityCache) || {}; },
    /** Serializes cache dimensions deterministically. */ stableStringify: function (value) { if (Array.isArray(value)) return '[' + value.map(item => this.stableStringify(item)).join(',') + ']'; if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + this.stableStringify(value[key])).join(',') + '}'; return JSON.stringify(value); },
    /** Builds an opaque tenant-partitioned logical key containing every result dimension. */
    buildKey: function (enterpriseCode, request) { let policy = this.policy(); let material = this.stableStringify({ enterpriseCode, context: request.context || {}, item: request.item || {} }); let key = String(policy.keyPrefix || 'stockAvailability:') + crypto.createHash('sha256').update(material).digest('hex'); if (key.length > Number(policy.maximumKeyLength || 256)) throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00030', 'Availability cache key exceeds configured boundary'); return key; },
    /** Returns common provider-neutral cache options. */ options: function (request, key) { let policy = this.policy(); return { tenant: request.tenant, authData: request.authData, moduleName: policy.moduleName || 'inventory', channelName: policy.channelName || 'availability', key, cacheLayer: 'availability', resourceName: 'stockAvailability' }; },
    /** Rejects a cached result when any authoritative Balance revision changed or disappeared. */
    validateEvidence: async function (request, result) { if (this.policy().validateEvidenceOnHit === false || !result || !Array.isArray(result.evidence) || !result.evidence.length) return true; let codes = result.evidence.map(value => value.stockCode); let response = await SERVICE.DefaultStockBalanceService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: result.enterpriseCode, code: { $in: codes } }, searchOptions: { limit: codes.length + 1 } }); let items = response && Array.isArray(response.result) ? response.result : []; let revisions = new Map(items.map(value => [value.code, Number(value.revision)])); return items.length === codes.length && result.evidence.every(value => revisions.get(value.stockCode) === Number(value.revision)); },
    /** Serves a validated hit or recomputes with fail-open cache-provider behavior. */
    evaluate: async function (request) { let policy = this.policy(); let enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request); if (policy.enabled === false || request.at && policy.cacheExplicitEvaluationTime !== true || !SERVICE.DefaultCacheService) return SERVICE.DefaultStockAvailabilityService.evaluate(request); let key = this.buildKey(enterpriseCode, request); let options = this.options(request, key); try { let cached = await SERVICE.DefaultCacheService.get(options); if (await this.validateEvidence(request, cached)) return cached; } catch (error) { /* cache miss and provider failure both fall through to authority */ } let result = await SERVICE.DefaultStockAvailabilityService.evaluate(request); let ttl = Number(policy.ttlSeconds || 15); if (Number.isFinite(ttl) && ttl > 0) await SERVICE.DefaultCacheService.put(Object.assign({}, options, { value: result, ttl })).catch(() => false); return result; },
    /** Flushes tenant Availability and relies on nCache for peer propagation when required. */
    invalidate: function (request) { let policy = this.policy(); if (policy.enabled === false || !SERVICE.DefaultCacheService) return Promise.resolve(true); return SERVICE.DefaultCacheService.flushCache({ tenant: request.tenant, authData: request.authData, moduleName: policy.moduleName || 'inventory', channelName: policy.channelName || 'availability', prefix: policy.keyPrefix || 'stockAvailability:', cacheLayer: 'availability', resourceName: 'stockAvailability', internalCacheOperation: true }); }
};
