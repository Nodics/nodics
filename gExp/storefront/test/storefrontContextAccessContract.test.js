/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module storefront/test/storefrontContextAccessContract @description Validates opaque issuance, protected audience introspection, expiry, least disclosure, and fail-closed storage behavior. @layer test @owner storefront */
const assert = require('assert');
const service = require('../src/service/defaultStorefrontContextAccessService');
let values = new Map();
global.CONFIG = { get: name => name === 'storefront' ? { contextResolution: { defaultTenant: 'default' }, contextAccess: {
    enabled: true, headerName: 'x-nodics-storefront-context', moduleName: 'storefront', channelName: 'contextAccess',
    keyPrefix: 'storefrontContextAccess:', ttlSeconds: 120, tokenBytes: 32, maximumHandleLength: 256,
    audiences: ['cms', 'product', 'pricing', 'inventory'] } } : {} };
global.SERVICE = {
    DefaultStorefrontEnterpriseScopeService: { error: (code, message) => Object.assign(new Error(message), { code: code }) },
    DefaultCacheService: {
        put: options => { values.set(options.key, options.value); return Promise.resolve(true); },
        get: options => values.has(options.key) ? Promise.resolve(values.get(options.key)) : Promise.reject(Object.assign(new Error('miss'), { code: 'ERR_CACHE_00001' })),
        consume: options => { let value = values.get(options.key); values.delete(options.key); return Promise.resolve(value); },
        flushCache: options => { (options.keys || []).forEach(key => values.delete(key)); return Promise.resolve(true); }
    }
};
(async () => {
    let resolved = { _authority: { tenantCode: 'tenant-secret', enterpriseCode: 'enterprise-secret' }, storefrontCode: 'electronics',
        downstream: { product: { catalogCode: 'electronicsProduct', locale: 'en-AE' }, cms: {}, pricing: {}, inventory: {} } };
    let access = await service.issue(resolved);
    assert(access.handle.length >= 32);
    assert(!access.handle.includes('tenant-secret') && !access.handle.includes('enterprise-secret'));
    assert.strictEqual(access.header, 'x-nodics-storefront-context');
    let active = await service.introspect({ authData: { tokenType: 'service' }, body: { handle: access.handle, audience: 'product' } });
    assert.deepStrictEqual(active.context, { catalogCode: 'electronicsProduct', locale: 'en-AE' });
    assert.strictEqual(active.tenantCode, 'tenant-secret');
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: access.handle, audience: 'unknown' } })).active, false);
    await assert.rejects(service.introspect({ authData: { tokenType: 'access' }, body: { handle: access.handle, audience: 'product' } }), error => error.code === 'ERR_STOREFRONT_00011');
    let rotated = await service.refresh({ body: { handle: access.handle } });
    assert.notStrictEqual(rotated.handle, access.handle);
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: access.handle, audience: 'product' } })).active, false);
    await assert.rejects(service.refresh({ body: { handle: access.handle } }), error => error.code === 'ERR_STOREFRONT_00018');
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: rotated.handle, audience: 'product' } })).active, true);
    await service.revoke({ authData: { tokenType: 'service' }, body: { handle: rotated.handle, reason: 'logout' } });
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: rotated.handle, audience: 'product' } })).active, false);
    await assert.rejects(service.revoke({ authData: { tokenType: 'access' }, body: { handle: rotated.handle } }), error => error.code === 'ERR_STOREFRONT_00011');
    let expired = await service.issue(resolved);
    values.get(service.key(expired.handle)).expiresAt = Date.now() - 1;
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: expired.handle, audience: 'product' } })).active, false);
    SERVICE.DefaultCacheService.get = () => Promise.reject(new Error('provider down'));
    assert.strictEqual((await service.introspect({ authData: { tokenType: 'service' }, body: { handle: access.handle, audience: 'product' } })).active, false);
    SERVICE.DefaultCacheService.put = () => Promise.reject(new Error('provider down'));
    await assert.rejects(service.issue(resolved));
    console.log('Storefront context access contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
