/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
let effective = JSON.parse(JSON.stringify(defaults)), catalogQuery, moduleRequest, mediaLookupRequest;
effective.item.itemTypes.push('PROJECT_ITEM'); effective.references.providers.catalog = 'ProjectCatalogReferenceProviderService';
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'product' ? effective : undefined }; global.SERVICE = {
    DefaultCatalogService: { get: async request => { catalogQuery = request; return { result: [{ code: 'retail' }] }; } },
    DefaultUnitsReferenceService: { convertInternal: async () => ({ fromUnit: { unitCode: 'piece' }, toUnit: { unitCode: 'piece' } }) },
    DefaultMediaReferenceLookupService: { validateInternal: async request => { mediaLookupRequest = request; return { referenceType: request.body.referenceType, code: request.body.referenceCode }; } },
    DefaultModuleService: { buildRequest: input => input, fetch: async request => { moduleRequest = request; return { data: { fromUnit: { unitCode: 'kg' }, toUnit: { unitCode: 'kg' } } }; } }
}; global.NODICS = { getInternalAuthToken: () => 'test-token' };
const catalog = require('../src/service/reference/defaultProductCatalogReferenceProviderService'), units = require('../src/service/reference/defaultProductUnitsReferenceProviderService'), media = require('../src/service/reference/defaultProductMediaReferenceProviderService');
(async () => {
    assert(effective.item.itemTypes.includes('PROJECT_ITEM')); assert.strictEqual(effective.references.providers.catalog, 'ProjectCatalogReferenceProviderService');
    assert.strictEqual(await catalog.validate({ tenant: 't1', authData: {}, code: 'retail' }), true); assert.deepStrictEqual(catalogQuery.query, { code: 'retail', active: true });
    assert.strictEqual(await units.validate({ tenant: 't1', authData: {}, enterpriseCode: 'entA', code: 'piece' }), true);
    assert.strictEqual(await media.validate({ tenant: 't1', authData: {}, enterpriseCode: 'entA', kind: 'mediaSet', code: 'phone-primary-set' }), true); assert.deepStrictEqual(mediaLookupRequest.body, { referenceType: 'MEDIA_SET', referenceCode: 'phone-primary-set' });
    effective.unitsReference.preferLocal = false; assert.strictEqual(await units.validate({ tenant: 't1', authData: {}, enterpriseCode: 'entA', code: 'kg' }), true); assert.strictEqual(moduleRequest.moduleName, 'units'); assert.strictEqual(moduleRequest.header['x-enterprise-code'], 'entA');
    effective.mediaReference.preferLocal = false; SERVICE.DefaultModuleService.fetch = async request => { moduleRequest = request; return { data: { referenceType: 'MEDIA', code: 'phone-primary-file' } }; }; assert.strictEqual(await media.validate({ tenant: 't1', authData: {}, enterpriseCode: 'entA', kind: 'media', code: 'phone-primary-file' }), true); assert.strictEqual(moduleRequest.moduleName, 'media'); assert.strictEqual(moduleRequest.apiName, '/references/media/validate');
    console.log('Product P0 provider and later-layer override contract validated');
})().catch(error => { console.error(error); process.exit(1); });
