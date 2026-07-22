/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/test/storefrontCrossModuleJourneyContract
 * @description Proves two hostnames in one tenant remain isolated through Storefront issuance and CMS, Product, Pricing, and Inventory consumption in co-hosted and modular transport modes.
 * @layer test
 * @owner storefront
 * @override Extend when a new Storefront audience is implemented, while preserving existing module authorities and fail-closed context validation.
 */
const assert = require('assert');
const storefrontContext = require('../src/service/defaultStorefrontContextService');
const contextAccess = require('../src/service/defaultStorefrontContextAccessService');
const cmsProvider = require('../../../gContent/cms/src/service/delivery/defaultCmsStorefrontContextProviderService');
const productProvider = require('../../../gComm/product/src/service/delivery/defaultProductStorefrontContextProviderService');
const pricingProvider = require('../../../gComm/pricing/src/service/resolution/defaultPricingStorefrontContextProviderService');
const inventoryProvider = require('../../../gComm/inventory/src/service/availability/defaultInventoryStorefrontContextProviderService');
const configurations = {
    storefront: { contextResolution: { defaultTenant: 'default' }, contextAccess: { enabled: true,
        headerName: 'x-nodics-storefront-context', moduleName: 'storefront', channelName: 'contextAccess',
        keyPrefix: 'storefrontContextAccess:', ttlSeconds: 120, tokenBytes: 32, maximumHandleLength: 256,
        audiences: ['cms', 'product', 'pricing', 'inventory'] } },
    cms: { storefrontContext: { headerName: 'x-nodics-storefront-context', preferLocal: true } },
    product: { storefrontContext: { headerName: 'x-nodics-storefront-context', preferLocal: true } },
    pricing: { storefrontContext: { headerName: 'x-nodics-storefront-context', preferLocal: true } },
    inventory: { storefrontContext: { headerName: 'x-nodics-storefront-context', preferLocal: true } }
};
global.CONFIG = { get: name => configurations[name] || {} };
const error = (code, message) => Object.assign(new Error(message), { code: code });
let cache = new Map(), descriptors = [];
const storefronts = {
    apparel: { storefrontCode: 'apparel', name: 'Apparel', cmsSiteCode: 'apparelSite', storeCodes: ['apparelStore'],
        defaultStoreCode: 'apparelStore', productCatalogCodes: ['apparelProduct'], defaultProductCatalogCode: 'apparelProduct',
        countryCodes: ['AE'], defaultCountryCode: 'AE', localeCodes: ['en-AE'], defaultLocaleCode: 'en-AE',
        currencyCodes: ['AED'], defaultCurrencyCode: 'AED', channelCodes: ['WEB'], defaultChannelCode: 'WEB', status: 'ACTIVE' },
    electronics: { storefrontCode: 'electronics', name: 'Electronics', cmsSiteCode: 'electronicsSite', storeCodes: ['electronicsStore'],
        defaultStoreCode: 'electronicsStore', productCatalogCodes: ['electronicsProduct'], defaultProductCatalogCode: 'electronicsProduct',
        countryCodes: ['US'], defaultCountryCode: 'US', localeCodes: ['en-US'], defaultLocaleCode: 'en-US',
        currencyCodes: ['USD'], defaultCurrencyCode: 'USD', channelCodes: ['MOBILE'], defaultChannelCode: 'MOBILE', status: 'ACTIVE' }
};
const endpoints = {
    'apparel.nodics.com': { hostname: 'apparel.nodics.com', storefrontCode: 'apparel', tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', status: 'ACTIVE' },
    'electronics.nodics.com': { hostname: 'electronics.nodics.com', storefrontCode: 'electronics', tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', status: 'ACTIVE' }
};
global.SERVICE = {
    DefaultStorefrontEnterpriseScopeService: { error: error },
    DefaultProductEnterpriseScopeService: { error: error },
    DefaultPricingEnterpriseScopeService: { error: error },
    DefaultInventoryEnterpriseScopeService: { error: error },
    DefaultStorefrontEndpointFoundationService: { normalizeHostname: value => String(value || '').trim().toLowerCase() },
    DefaultStorefrontEndpointService: { get: request => Promise.resolve({ result: endpoints[request.query.hostname] ? [endpoints[request.query.hostname]] : [] }) },
    DefaultStorefrontService: { get: request => Promise.resolve({ result: storefronts[request.query.storefrontCode] ? [storefronts[request.query.storefrontCode]] : [] }) },
    DefaultStorefrontCmsSiteReferenceProviderService: { resolve: (request, code) => Promise.resolve({ cmsSiteCode: code }) },
    DefaultStorefrontStoreReferenceProviderService: { resolve: (request, code) => Promise.resolve({ storeCode: code }) },
    DefaultCacheService: {
        put: options => { cache.set(options.key, options.value); return Promise.resolve(true); },
        get: options => cache.has(options.key) ? Promise.resolve(cache.get(options.key)) : Promise.reject(Object.assign(new Error('cache miss'), { code: 'ERR_CACHE_00001' }))
    },
    DefaultStorefrontContextAccessService: contextAccess,
    DefaultModuleService: {
        buildRequest: descriptor => { descriptors.push(descriptor); return descriptor; },
        fetch: descriptor => contextAccess.introspect({ authData: { tokenType: 'service', principalId: 'remote-consumer' }, body: descriptor.requestBody })
            .then(data => ({ data: { data: data } }))
    }
};
global.NODICS = { getInternalAuthToken: () => 'service-token' };
const request = (handle, body) => ({ headers: { 'x-nodics-storefront-context': handle }, body: body || {}, query: {} });
const assertApparel = async function (handle) {
    let cms = request(handle); await cmsProvider.apply(cms);
    assert.deepStrictEqual(cms.delivery, { site: 'apparelSite', locale: 'en-AE', channel: 'WEB' });
    let product = request(handle); product.query = { catalogCode: 'electronicsProduct', localeCode: 'en-US' }; await productProvider.apply(product);
    assert.strictEqual(product.query.catalogCode, 'apparelProduct'); assert.strictEqual(product.query.localeCode, 'en-AE');
    let pricing = request(handle, { currencyCode: 'USD', context: { storeCode: 'electronicsStore' }, item: {}, quantity: '1', unitCode: 'piece' });
    await pricingProvider.apply(pricing); assert.strictEqual(pricing.body.currencyCode, 'AED');
    assert.deepStrictEqual(pricing.body.context, { siteCode: 'apparelSite', storeCode: 'apparelStore', channelCode: 'WEB' });
    let inventory = request(handle, { context: { storeCode: 'electronicsStore', countryCode: 'US' }, item: { itemType: 'SKU', itemCode: 'shirt', unitCode: 'piece' } });
    await inventoryProvider.apply(inventory);
    assert.deepStrictEqual(inventory.body.context, { storeCode: 'apparelStore', countryCode: 'AE', channelCode: 'WEB' });
};
(async () => {
    let apparel = await storefrontContext.resolve({ hostname: 'apparel.nodics.com' });
    let electronics = await storefrontContext.resolve({ hostname: 'electronics.nodics.com' });
    assert.strictEqual(apparel._authority.tenantCode, electronics._authority.tenantCode);
    assert.strictEqual(apparel._authority.enterpriseCode, electronics._authority.enterpriseCode);
    assert.notDeepStrictEqual(apparel.downstream, electronics.downstream);
    let apparelAccess = await contextAccess.issue(apparel), electronicsAccess = await contextAccess.issue(electronics);
    assert.notStrictEqual(apparelAccess.handle, electronicsAccess.handle);
    await assertApparel(apparelAccess.handle);
    let electronicProduct = request(electronicsAccess.handle); await productProvider.apply(electronicProduct);
    assert.strictEqual(electronicProduct.query.catalogCode, 'electronicsProduct');
    let electronicPricing = request(electronicsAccess.handle, { item: {}, quantity: '1', unitCode: 'piece' }); await pricingProvider.apply(electronicPricing);
    assert.strictEqual(electronicPricing.body.currencyCode, 'USD'); assert.strictEqual(electronicPricing.body.context.storeCode, 'electronicsStore');
    assert.strictEqual((await contextAccess.introspect({ authData: { tokenType: 'service' }, body: { handle: apparelAccess.handle, audience: 'unknown' } })).active, false);
    for (let moduleName of ['cms', 'product', 'pricing', 'inventory']) configurations[moduleName].storefrontContext.preferLocal = false;
    await assertApparel(apparelAccess.handle);
    assert.strictEqual(descriptors.length, 4);
    assert.deepStrictEqual(descriptors.map(value => value.requestBody.audience), ['cms', 'product', 'pricing', 'inventory']);
    assert(descriptors.every(value => value.header.Authorization === 'Bearer service-token' && value.followRedirects === false));
    let stored = cache.get(contextAccess.key(apparelAccess.handle)); stored.expiresAt = Date.now() - 1;
    await assert.rejects(productProvider.apply(request(apparelAccess.handle)), value => value.code === 'ERR_PRODUCT_00067');
    SERVICE.DefaultCacheService.get = () => Promise.reject(new Error('security state unavailable'));
    await assert.rejects(inventoryProvider.apply(request(electronicsAccess.handle)), value => value.code === 'ERR_INV_00052');
    console.log('Storefront cross-module hostname journey validated');
})().catch(value => { console.error(value); process.exitCode = 1; });
