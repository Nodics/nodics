/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
/** @module product/service/delivery/DefaultProductDeliveryCacheService @description Caches immutable release-qualified Product views through DefaultCacheService only. @layer service @owner product */
module.exports = {
    /** Initializes Product delivery caching. */ init: function () { return Promise.resolve(true); },
    /** Completes cache initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Product cache policy. */ policy: function () { return (CONFIG.get('product') || {}).cache || {}; },
    /** Creates a stable cache key from trusted scope, request, and active release. */ key: function (identity, releaseVersion) { let policy = this.policy(), text = JSON.stringify({ enterpriseCode: identity.enterpriseCode, catalogCode: identity.catalogCode, itemType: identity.itemType, itemCode: identity.itemCode, localeCode: identity.localeCode || '', expansions: identity.expansions.slice().sort(), releaseVersion: releaseVersion }), key = String(policy.keyPrefix || 'productDelivery:') + crypto.createHash('sha256').update(text).digest('hex'); if (key.length > Number(policy.maximumKeyLength || 256)) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00064', 'Product delivery cache key exceeds configured bounds'); return key; },
    /** Builds authoritative cache options. */ options: function (request, key) { let policy = this.policy(); return { tenant: request.tenant, authData: request.authData, moduleName: policy.moduleName || 'product', channelName: policy.channelName || 'delivery', key: key, cacheLayer: 'delivery', resourceName: 'productDelivery' }; },
    /** Resolves through active-pointer-qualified cache with authority fallback. */ resolve: async function (request) { let policy = this.policy(), identity = SERVICE.DefaultProductOnlineReadService.identity(request), release = await SERVICE.DefaultProductOnlineReadService.release(identity, request); if (policy.enabled === false || !SERVICE.DefaultCacheService) return SERVICE.DefaultProductOnlineReadService.project(identity, release); let key = this.key(identity, release.pointer.manifestCode), options = this.options(request, key); try { let cached = await SERVICE.DefaultCacheService.get(options); if (cached && cached.releaseVersion === release.pointer.manifestCode) return cached; } catch (error) { /* cache failure does not replace Product authority */ } let result = SERVICE.DefaultProductOnlineReadService.project(identity, release), ttl = Number(policy.ttlSeconds || 300); if (ttl > 0) await SERVICE.DefaultCacheService.put(Object.assign({}, options, { value: result, ttl: ttl })).catch(() => false); return result; },
    /** Invalidates Product delivery through tenant-aware resource invalidation. */ invalidate: function (request) { let policy = this.policy(); if (policy.enabled === false || !SERVICE.DefaultCacheService || typeof SERVICE.DefaultCacheService.invalidateResource !== 'function') return Promise.resolve(true); return SERVICE.DefaultCacheService.invalidateResource({ tenant: request.tenant, authData: request.authData, moduleName: policy.moduleName || 'product', cacheType: 'item', resourceName: 'productDelivery', internalCacheOperation: true }); }
};
