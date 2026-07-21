/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/test/ProductProviderAndOverrideContract
 * @description Proves reuse of Catalog and Units authorities and later-layer replacement of Product policy and provider contracts.
 * @layer test
 * @owner product
 * @override This test demonstrates the supported project-layer customization path.
 */
const assert = require('assert'), defaults = require('../config/properties').product;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
let effective = JSON.parse(JSON.stringify(defaults)), catalogQuery, moduleRequest;
effective.item.itemTypes.push('PROJECT_ITEM'); effective.references.providers.catalog = 'ProjectCatalogReferenceProviderService';
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'product' ? effective : undefined }; global.SERVICE = {
    DefaultCatalogService: { get: async request => { catalogQuery = request; return { result: [{ code: 'retail' }] }; } },
    DefaultUnitsReferenceService: { convertInternal: async () => ({ fromUnit: { unitCode: 'piece' }, toUnit: { unitCode: 'piece' } }) },
    DefaultModuleService: { buildRequest: input => input, fetch: async request => { moduleRequest = request; return { data: { fromUnit: { unitCode: 'kg' }, toUnit: { unitCode: 'kg' } } }; } }
}; global.NODICS = { getInternalAuthToken: () => 'test-token' };
const catalog = require('../src/service/reference/defaultProductCatalogReferenceProviderService'), units = require('../src/service/reference/defaultProductUnitsReferenceProviderService');
(async () => {
    assert(effective.item.itemTypes.includes('PROJECT_ITEM')); assert.strictEqual(effective.references.providers.catalog, 'ProjectCatalogReferenceProviderService');
    assert.strictEqual(await catalog.validate({ tenant: 't1', authData: {}, code: 'retail' }), true); assert.deepStrictEqual(catalogQuery.query, { code: 'retail', active: true });
    assert.strictEqual(await units.validate({ tenant: 't1', authData: {}, enterpriseCode: 'entA', code: 'piece' }), true);
    effective.unitsReference.preferLocal = false; assert.strictEqual(await units.validate({ tenant: 't1', authData: {}, enterpriseCode: 'entA', code: 'kg' }), true); assert.strictEqual(moduleRequest.moduleName, 'units'); assert.strictEqual(moduleRequest.header['x-enterprise-code'], 'entA');
    console.log('Product P0 provider and later-layer override contract validated');
})().catch(error => { console.error(error); process.exit(1); });
