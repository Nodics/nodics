/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module storefront/test/storefrontDownstreamHandoffContract
 * @description Verifies CMS, Product, Pricing, and Inventory receive only client routing hints and retain their own enterprise or tenant authority paths.
 * @layer test
 * @owner storefront
 * @override Add every new downstream consumer while forbidding delegated tenant, enterprise, token, or permission authority.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const context = require('../src/service/defaultStorefrontContextService');
const repositoryRoot = path.resolve(__dirname, '../../..');

const item = {
    cmsSiteCode: 'site', defaultStoreCode: 'store', defaultProductCatalogCode: 'catalog',
    defaultLocaleCode: 'en-AE', defaultCurrencyCode: 'AED', defaultCountryCode: 'AE', defaultChannelCode: 'WEB',
    enterpriseCode: 'must-not-leak', tenantCode: 'must-not-leak', authToken: 'must-not-leak'
};
const handoff = context.downstreamContext(item);
assert.deepStrictEqual(Object.keys(handoff).sort(), ['cms', 'inventory', 'pricing', 'product']);
let serialized = JSON.stringify(handoff);
['enterpriseCode', 'tenantCode', 'authToken', 'principalId', 'permission'].forEach(name => assert(!serialized.includes(name), name));
assert.deepStrictEqual(handoff.cms, { site: 'site', locale: 'en-AE', channel: 'WEB' });
assert.deepStrictEqual(handoff.product, { catalogCode: 'catalog', locale: 'en-AE' });
assert.deepStrictEqual(handoff.pricing, { siteCode: 'site', storeCode: 'store', currencyCode: 'AED', channelCode: 'WEB' });
assert.deepStrictEqual(handoff.inventory, { storeCode: 'store', countryCode: 'AE', channelCode: 'WEB' });

[
    ['gContent/cms/src/service/delivery/defaultCmsDeliveryService.js', 'DefaultCmsPageRouteService'],
    ['gComm/baseCommerce/product/src/service/delivery/defaultProductOnlineReadService.js', 'DefaultProductEnterpriseScopeService'],
    ['gComm/baseCommerce/pricing/src/service/resolution/defaultPriceResolutionService.js', 'DefaultPricingEnterpriseScopeService'],
    ['gComm/baseCommerce/inventory/src/service/sourcing/defaultStockSourcingIntentService.js', 'DefaultInventoryEnterpriseScopeService']
].forEach(([relativePath, authority]) => {
    let source = fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
    assert(source.includes(authority), relativePath + ' must retain target-owned authority through ' + authority);
});
console.log('Storefront downstream handoff contract validated');
