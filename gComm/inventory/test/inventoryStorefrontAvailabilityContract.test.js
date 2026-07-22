/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/test/inventoryStorefrontAvailabilityContract @description Validates audience binding, exact item input, trusted sourcing scope, customer-safe projection, modular transport, and fail-closed Storefront availability. @layer test @owner inventory @override Preserve these assertions when extending Inventory delivery. */
const assert = require('assert');
const provider = require('../src/service/availability/defaultInventoryStorefrontContextProviderService');
const intent = require('../src/service/availability/defaultStockAvailabilityIntentService');
const routers = require('../src/router/routers').inventory.stockAvailabilityIntent;
let remoteDescriptor;
global.CONFIG = { get: name => name === 'inventory' ? { storefrontContext: { headerName: 'x-nodics-storefront-context', preferLocal: true }, stockAvailability: {} } : {} };
global.SERVICE = {
    DefaultInventoryEnterpriseScopeService: { error: (code, message) => Object.assign(new Error(message), { code: code }) },
    DefaultStorefrontContextAccessService: { introspect: request => Promise.resolve({ active: true, audience: request.body.audience,
        tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', storefrontCode: request.body.handle.startsWith('a') ? 'apparel' : 'electronics',
        context: request.body.handle.startsWith('a')
            ? { storeCode: 'apparelStore', countryCode: 'AE', channelCode: 'WEB' }
            : { storeCode: 'electronicsStore', countryCode: 'US', channelCode: 'MOBILE' } }) },
    DefaultStockAvailabilityCacheService: { evaluate: request => Promise.resolve({ enterpriseCode: request.authData.enterpriseCode,
        type: 'ON_HAND', item: request.item, quantity: '12.500000', unitCode: request.item.unitCode,
        onHandQuantity: '12.500000', reservedQuantity: '2.000000', availableToSell: '10.500000',
        poolCodes: ['privatePool'], warehouseCodes: ['privateWarehouse'],
        evidence: [{ stockCode: 'privateBalance', revision: 9 }], evaluatedAt: '2026-07-22T00:00:00.000Z' }) },
    DefaultModuleService: {
        buildRequest: descriptor => { remoteDescriptor = descriptor; return descriptor; },
        fetch: () => Promise.resolve({ data: { data: { active: true, audience: 'inventory', tenantCode: 'tenantB',
            enterpriseCode: 'enterpriseB', storefrontCode: 'remote', context: {
                storeCode: 'remoteStore', countryCode: 'GB', channelCode: 'WEB' } } } })
    }
};
global.NODICS = { getInternalAuthToken: () => 'service-token' };
(async () => {
    assert.strictEqual(routers.evaluateOnHand.secured, true);
    assert.strictEqual(routers.evaluateStorefront.publicAccess, true);
    assert.strictEqual(routers.evaluateStorefront.cache.enabled, false);
    let apparel = { headers: { 'x-nodics-storefront-context': 'a'.repeat(43) }, body: {
        item: { itemType: 'SKU', itemCode: 'fabric', unitCode: 'KG', targetScale: 18 },
        context: { storeCode: 'attackerStore', customerSegmentCode: 'vip' } } };
    await provider.apply(apparel);
    assert.strictEqual(apparel.tenant, 'tenantA');
    assert.strictEqual(apparel.authData.enterpriseCode, 'enterpriseA');
    assert.deepStrictEqual(apparel.body.context, { storeCode: 'apparelStore', countryCode: 'AE', channelCode: 'WEB' });
    assert.strictEqual(apparel.body.item.targetScale, 18);
    let response = await intent.evaluateStorefront(apparel);
    assert.strictEqual(response.data.availableToSell, '10.500000');
    assert.strictEqual(response.data.item.itemCode, 'fabric');
    ['enterpriseCode', 'poolCodes', 'warehouseCodes', 'evidence'].forEach(key => assert.strictEqual(response.data[key], undefined));
    let electronics = { headers: { 'x-nodics-storefront-context': 'e'.repeat(43) }, body: {
        item: { itemType: 'SKU', itemCode: 'phone', unitCode: 'piece' } } };
    await provider.apply(electronics);
    assert.deepStrictEqual(electronics.body.context, { storeCode: 'electronicsStore', countryCode: 'US', channelCode: 'MOBILE' });
    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.resolve({ active: false });
    await assert.rejects(provider.apply({ headers: { 'x-nodics-storefront-context': 'x'.repeat(43) }, body: {} }), error => error.code === 'ERR_INV_00052');
    await assert.rejects(provider.apply({ headers: {}, body: {} }), error => error.code === 'ERR_INV_00052');
    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.reject(new Error('storefront unavailable'));
    await assert.rejects(provider.apply({ headers: { 'x-nodics-storefront-context': 'y'.repeat(43) }, body: {} }), error => error.code === 'ERR_INV_00052');
    await assert.rejects(intent.evaluateStorefront({ authData: { tokenType: 'storefront_context' }, body: {} }), error => error.code === 'ERR_INV_00052');
    CONFIG.get = name => name === 'inventory' ? { storefrontContext: { preferLocal: false, bootstrapTenant: 'bootstrap' }, stockAvailability: {} } : {};
    let remote = { headers: { 'x-nodics-storefront-context': 'r'.repeat(43) }, body: {
        item: { itemType: 'SKU', itemCode: 'remote', unitCode: 'piece' } } };
    await provider.apply(remote);
    assert.strictEqual(remote.body.context.countryCode, 'GB');
    assert.strictEqual(remoteDescriptor.methodName, 'POST');
    assert.deepStrictEqual(remoteDescriptor.requestBody, { handle: 'r'.repeat(43), audience: 'inventory' });
    assert.strictEqual(remoteDescriptor.header.Authorization, 'Bearer service-token');
    assert.strictEqual(remoteDescriptor.followRedirects, false);
    assert.strictEqual(remoteDescriptor.maxAttempts, 1);
    console.log('Inventory Storefront availability contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
