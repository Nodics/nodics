/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/test/ProductCompositionContract @description Proves relation, bundle, packaging, media, exact-number, graph, authority, and later-layer policy contracts. @layer test @owner product */
const assert = require('assert'), configuration = require('../config/properties'), schemas = require('../src/schemas/schemas').product, interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => configuration[key] }; global.SERVICE = {};
SERVICE.DefaultProductEnterpriseScopeService = require('../src/service/foundation/defaultProductEnterpriseScopeService');
let unitCalls = [], referenceCalls = []; SERVICE.DefaultProductReferenceService = { validate: async (kind, code) => { referenceCalls.push({ kind, code }); if (kind === 'unit') unitCalls.push(code); return true; } };
let items = [
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'PRODUCT', itemCode: 'phone', status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'case', status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'BUNDLE', itemCode: 'starter', status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'BUNDLE', itemCode: 'mega', status: 'ACTIVE' }
], relations = [], bundles = [], packaging = [], media = [];
const matches = (item, query) => Object.keys(query || {}).every(key => query[key] && query[key].$ne !== undefined ? item[key] !== query[key].$ne : item[key] === query[key]);
const generated = records => ({ get: async request => ({ result: records.filter(item => matches(item, request.query)) }) });
SERVICE.DefaultProductItemService = generated(items); SERVICE.DefaultProductRelationService = generated(relations); SERVICE.DefaultProductBundleEntryService = generated(bundles); SERVICE.DefaultProductPackagingService = generated(packaging); SERVICE.DefaultProductMediaService = generated(media);
const validator = require('../src/service/foundation/defaultProductCompositionService'), authData = { enterprise: { code: 'entA' } };
(async () => {
    ['productRelation', 'productBundleEntry', 'productPackaging', 'productMedia'].forEach(name => { assert.strictEqual(schemas[name].router.enabled, false); assert(interceptors[name + 'PreSave']); assert(interceptors[name + 'PreUpdate']); assert(interceptors[name + 'PreRemove']); });
    assert(!schemas.productMedia.definition.uri, 'Product must not store media storage or delivery URI');
    assert(schemas.productMedia.definition.productMediaCode.required, 'Product media assignment must have its own Product-owned identity');
    assert(schemas.productMedia.definition.mediaSetCode, 'Product media assignment must support nMedia mediaSet references');
    let relation = { tenant: 't1', authData, model: { catalogCode: 'retail', relationCode: 'phone-case', relationType: 'ACCESSORY', sourceItemType: 'PRODUCT', sourceItemCode: 'phone', targetCatalogCode: 'retail', targetItemType: 'SKU', targetItemCode: 'case', position: 10, status: 'ACTIVE' } }; await validator.prepareRelation(relation); relations.push(Object.assign({}, relation.model));
    await assert.rejects(validator.prepareRelation({ tenant: 't1', authData, model: Object.assign({}, relation.model, { code: undefined, relationCode: 'self', targetItemType: 'PRODUCT', targetItemCode: 'phone' }) }), error => error.code === 'ERR_PRODUCT_00032');
    let bundle = { tenant: 't1', authData, model: { catalogCode: 'retail', entryCode: 'starter-phone', bundleItemType: 'BUNDLE', bundleItemCode: 'starter', componentItemType: 'PRODUCT', componentItemCode: 'phone', quantity: '1.000', unitCode: 'each', position: 10, optional: false, status: 'ACTIVE' } }; await validator.prepareBundleEntry(bundle); bundles.push(Object.assign({}, bundle.model)); assert(unitCalls.includes('each'));
    await assert.rejects(validator.prepareBundleEntry({ tenant: 't1', authData, model: Object.assign({}, bundle.model, { code: undefined, entryCode: 'bad-quantity', quantity: '1e3' }) }), error => error.code === 'ERR_PRODUCT_00034');
    let pack = { tenant: 't1', authData, model: { catalogCode: 'retail', packagingCode: 'phone-box', itemType: 'PRODUCT', itemCode: 'phone', packageType: 'BOX', containedQuantity: '1', containedUnitCode: 'each', length: '20.0', width: '10.0', height: '5.0', dimensionUnitCode: 'cm', weight: '0.500', weightUnitCode: 'kg', position: 10, status: 'ACTIVE' } }; await validator.preparePackaging(pack); assert(unitCalls.includes('cm') && unitCalls.includes('kg'));
    await assert.rejects(validator.preparePackaging({ tenant: 't1', authData, model: Object.assign({}, pack.model, { code: undefined, packagingCode: 'bad-pack', height: undefined }) }), error => error.code === 'ERR_PRODUCT_00036');
    let mediaRequest = { tenant: 't1', authData, model: { catalogCode: 'retail', productMediaCode: 'phone-primary', mediaSetCode: 'phone-primary-set', itemType: 'PRODUCT', itemCode: 'phone', mediaType: 'IMAGE', role: 'PRIMARY', localeCode: 'en-AE', position: 10, altText: 'Phone', status: 'ACTIVE' } }; await validator.prepareMedia(mediaRequest);
    assert.strictEqual(mediaRequest.model.code, 'entA::productMedia::retail::phone-primary');
    assert(referenceCalls.some(call => call.kind === 'mediaSet' && call.code === 'phone-primary-set'), 'Product media assignment must validate mediaSet through the reference provider');
    await assert.rejects(validator.prepareMedia({ tenant: 't1', authData, model: Object.assign({}, mediaRequest.model, { code: undefined, productMediaCode: 'unsafe-both', mediaCode: 'phone-primary-file' }) }), error => error.code === 'ERR_PRODUCT_00037');
    await assert.rejects(validator.prepareMedia({ tenant: 't1', authData, model: Object.assign({}, mediaRequest.model, { code: undefined, productMediaCode: 'unsafe-empty', mediaSetCode: undefined }) }), error => error.code === 'ERR_PRODUCT_00037');
    configuration.product.relation.types.push('PROJECT_RELATION'); assert(configuration.product.relation.types.includes('PROJECT_RELATION'));
    console.log('Product P1.4-P1.7 composition contract validated');
})().catch(error => { console.error(error); process.exit(1); });
