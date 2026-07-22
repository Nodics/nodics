/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module product/test/productStorefrontDeliveryContract @description Validates Product audience binding, trusted scope replacement, and fail-closed Storefront delivery. @layer test @owner product */
const assert = require('assert');
const provider = require('../src/service/delivery/defaultProductStorefrontContextProviderService');
const routers = require('../src/router/routers').product.online;
global.CONFIG = { get: name => name === 'product' ? { storefrontContext: { headerName: 'x-nodics-storefront-context', preferLocal: true } } : {} };
global.SERVICE = {
    DefaultProductEnterpriseScopeService: { error: (code, message) => Object.assign(new Error(message), { code: code }) },
    DefaultStorefrontContextAccessService: { introspect: () => Promise.resolve({ active: true, audience: 'product', expiresAt: Date.now() + 10000,
        tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', storefrontCode: 'electronics', context: { catalogCode: 'electronicsCatalog', locale: 'en-AE' } }) }
};
(async () => {
    assert.strictEqual(routers.readItem.secured, true);
    assert.strictEqual(routers.readStorefrontItem.publicAccess, true);
    assert.strictEqual(routers.readStorefrontItem.cache.enabled, false);
    let request = { headers: { 'x-nodics-storefront-context': 'a'.repeat(43) }, query: { catalogCode: 'attackerCatalog', localeCode: 'xx', expand: 'media' } };
    await provider.apply(request);
    assert.strictEqual(request.tenant, 'tenantA');
    assert.strictEqual(request.authData.tokenType, 'storefront_context');
    assert.strictEqual(request.query.catalogCode, 'electronicsCatalog');
    assert.strictEqual(request.query.localeCode, 'en-AE');
    assert.strictEqual(request.query.expand, 'media');
    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.resolve({ active: false });
    await assert.rejects(provider.apply({ headers: { 'x-nodics-storefront-context': 'b'.repeat(43) } }), error => error.code === 'ERR_PRODUCT_00067');
    await assert.rejects(provider.apply({ headers: {} }), error => error.code === 'ERR_PRODUCT_00067');
    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.reject(new Error('storefront down'));
    await assert.rejects(provider.apply({ headers: { 'x-nodics-storefront-context': 'c'.repeat(43) } }), error => error.code === 'ERR_PRODUCT_00067');
    console.log('Product Storefront delivery contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
