/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
/** @module pricing/service/cache/DefaultPriceResolutionCacheService @description Provider-neutral cache for immutable Online price-resolution responses. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the policy Pricing contract. */
    policy: function () { return (CONFIG.get('pricing') || {}).cache || {}; },
    /** Executes the stable Pricing contract. */
    stable: function (value) { if (Array.isArray(value)) return '[' + value.map(item => this.stable(item)).join(',') + ']'; if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + this.stable(value[key])).join(',') + '}'; return JSON.stringify(value); },
    /** Executes the key Pricing contract. */
    key: function (enterpriseCode, body) { let policy = this.policy(), key = String(policy.keyPrefix || 'priceResolution:') + crypto.createHash('sha256').update(this.stable({ enterpriseCode: enterpriseCode, body: body })).digest('hex'); if (key.length > Number(policy.maximumKeyLength || 256)) throw SERVICE.DefaultPricingEnterpriseScopeService.error('ERR_PRICE_00040', 'Pricing cache key exceeds configured bounds'); return key; },
    /** Executes the options Pricing contract. */
    options: function (request, key) { let policy = this.policy(); return { tenant: request.tenant, authData: request.authData, moduleName: policy.moduleName || 'pricing', channelName: policy.channelName || 'resolution', key: key, cacheLayer: 'resolution', resourceName: 'priceResolution' }; },
    /** Executes the asynchronous resolve Pricing contract. */
    resolve: async function (request) {
        let policy = this.policy(), body = request.body || request, enterpriseCode = SERVICE.DefaultPricingEnterpriseScopeService.resolveEnterpriseCode(request);
        if (policy.enabled === false || body.at && policy.cacheExplicitEvaluationTime !== true || !SERVICE.DefaultCacheService) return SERVICE.DefaultPriceResolutionService.resolve(request);
        let key = this.key(enterpriseCode, body), options = this.options(request, key); try { let value = await SERVICE.DefaultCacheService.get(options); if (value) return value; } catch (error) { /* authority remains available */ }
        let value = await SERVICE.DefaultPriceResolutionService.resolve(request), ttl = Number(policy.ttlSeconds || 30); if (ttl > 0) await SERVICE.DefaultCacheService.put(Object.assign({}, options, { value: value, ttl: ttl })).catch(() => false); return value;
    },
    /** Executes the invalidate Pricing contract. */
    invalidate: function (request) { let policy = this.policy(); if (!SERVICE.DefaultCacheService || policy.enabled === false) return Promise.resolve(true); return SERVICE.DefaultCacheService.flushCache({ tenant: request.tenant, authData: request.authData, moduleName: policy.moduleName || 'pricing', channelName: policy.channelName || 'resolution', prefix: policy.keyPrefix || 'priceResolution:', cacheLayer: 'resolution', resourceName: 'priceResolution', internalCacheOperation: true }); }
};
