/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module pricing/test/pricingStorefrontResolutionContract @description Validates Pricing audience binding, exact inputs, trusted Storefront scope, modular transport, and fail-closed delivery. @layer test @owner pricing */
const assert = require('assert');
const provider = require('../src/service/resolution/defaultPricingStorefrontContextProviderService');
const routers = require('../src/router/routers').pricing.priceResolution;
let remoteDescriptor;
global.CONFIG = { get: name => name === 'pricing' ? { storefrontContext: { headerName: 'x-nodics-storefront-context', preferLocal: true } } : {} };
global.SERVICE = {
    DefaultPricingEnterpriseScopeService: { error: (code, message) => Object.assign(new Error(message), { code: code }) },
    DefaultStorefrontContextAccessService: { introspect: request => Promise.resolve({ active: true, audience: request.body.audience,
        tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', storefrontCode: request.body.handle.startsWith('a') ? 'apparel' : 'electronics',
        context: request.body.handle.startsWith('a')
            ? { siteCode: 'apparelSite', storeCode: 'apparelStore', currencyCode: 'AED', channelCode: 'WEB' }
            : { siteCode: 'electronicsSite', storeCode: 'electronicsStore', currencyCode: 'USD', channelCode: 'MOBILE' } }) },
    DefaultModuleService: {
        buildRequest: descriptor => { remoteDescriptor = descriptor; return descriptor; },
        fetch: () => Promise.resolve({ data: { data: { active: true, audience: 'pricing', tenantCode: 'tenantB',
            enterpriseCode: 'enterpriseB', storefrontCode: 'remote', context: {
                siteCode: 'remoteSite', storeCode: 'remoteStore', currencyCode: 'GBP', channelCode: 'WEB' } } } })
    }
};
global.NODICS = { getInternalAuthToken: () => 'service-token' };
(async () => {
    assert.strictEqual(routers.resolve.secured, true);
    assert.strictEqual(routers.resolveStorefront.publicAccess, true);
    assert.strictEqual(routers.resolveStorefront.cache.enabled, false);
    let apparel = { headers: { 'x-nodics-storefront-context': 'a'.repeat(43) }, body: { item: { itemType: 'SKU', itemCode: 'shirt' },
        quantity: '0.125000000000000001', unitCode: 'kg', currencyCode: 'XXX', context: { siteCode: 'attacker', customerCode: 'other' } } };
    await provider.apply(apparel);
    assert.strictEqual(apparel.tenant, 'tenantA');
    assert.strictEqual(apparel.authData.enterpriseCode, 'enterpriseA');
    assert.strictEqual(apparel.body.quantity, '0.125000000000000001');
    assert.strictEqual(apparel.body.currencyCode, 'AED');
    assert.deepStrictEqual(apparel.body.context, { siteCode: 'apparelSite', storeCode: 'apparelStore', channelCode: 'WEB' });
    let electronics = { headers: { 'x-nodics-storefront-context': 'e'.repeat(43) }, body: { item: { itemType: 'SKU', itemCode: 'phone' }, quantity: '1', unitCode: 'piece' } };
    await provider.apply(electronics);
    assert.deepStrictEqual(electronics.body.context, { siteCode: 'electronicsSite', storeCode: 'electronicsStore', channelCode: 'MOBILE' });
    assert.strictEqual(electronics.body.currencyCode, 'USD');
    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.resolve({ active: false });
    await assert.rejects(provider.apply({ headers: { 'x-nodics-storefront-context': 'x'.repeat(43) }, body: {} }), error => error.code === 'ERR_PRICE_00065');
    await assert.rejects(provider.apply({ headers: {}, body: {} }), error => error.code === 'ERR_PRICE_00065');
    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.reject(new Error('storefront unavailable'));
    await assert.rejects(provider.apply({ headers: { 'x-nodics-storefront-context': 'y'.repeat(43) }, body: {} }), error => error.code === 'ERR_PRICE_00065');
    CONFIG.get = name => name === 'pricing' ? { storefrontContext: { preferLocal: false, bootstrapTenant: 'bootstrap' } } : {};
    let remote = { headers: { 'x-nodics-storefront-context': 'r'.repeat(43) }, body: { item: { itemType: 'SKU', itemCode: 'remote' }, quantity: '1', unitCode: 'piece' } };
    await provider.apply(remote);
    assert.strictEqual(remote.body.currencyCode, 'GBP');
    assert.strictEqual(remoteDescriptor.methodName, 'POST');
    assert.deepStrictEqual(remoteDescriptor.requestBody, { handle: 'r'.repeat(43), audience: 'pricing' });
    assert.strictEqual(remoteDescriptor.header.Authorization, 'Bearer service-token');
    assert.strictEqual(remoteDescriptor.followRedirects, false);
    assert.strictEqual(remoteDescriptor.maxAttempts, 1);
    console.log('Pricing Storefront resolution contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
