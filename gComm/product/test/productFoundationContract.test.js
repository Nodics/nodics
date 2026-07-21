/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/test/ProductFoundationContract
 * @description Proves Product P0 schemas, enterprise isolation, derived identity, type policy, Catalog and Units references, lifecycle, and retained history.
 * @layer test
 * @owner product
 * @override Projects may extend configured item and identifier types while preserving identity, authority, and lifecycle contracts.
 */
const assert = require('assert'), configuration = require('../config/properties'), schemas = require('../src/schemas/schemas').product, interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => configuration[key] }; global.SERVICE = {};
SERVICE.DefaultProductEnterpriseScopeService = require('../src/service/foundation/defaultProductEnterpriseScopeService');
let references = [];
SERVICE.DefaultProductReferenceService = { validate: async (kind, code) => { references.push({ kind, code }); return true; } };
SERVICE.DefaultProductItemService = { get: async () => ({ result: [{ catalogCode: 'retail', itemType: 'SKU', itemCode: 'phone', status: 'ACTIVE' }] }) };
SERVICE.DefaultProductIdentifierService = SERVICE.DefaultProductItemService;
SERVICE.DefaultProductFoundationService = require('../src/service/foundation/defaultProductFoundationService');
(async () => {
    ['productItem', 'productIdentifier'].forEach(name => { assert.strictEqual(schemas[name].router.enabled, false); assert.strictEqual(schemas[name].isVersionedEnabled, false); assert(interceptors[name + 'PreSave']); assert(interceptors[name + 'PreGet']); assert(interceptors[name + 'PreUpdate']); assert(interceptors[name + 'PreRemove']); });
    let authData = { enterprise: { code: 'entA' } }, request = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', itemType: 'SKU', itemCode: 'phone', name: 'Phone', baseUnitCode: 'piece', sellable: true, stockManaged: true } };
    await SERVICE.DefaultProductFoundationService.prepareItem(request);
    assert.strictEqual(request.model.enterpriseCode, 'entA'); assert.strictEqual(request.model.code, 'entA::item::retail::SKU::phone'); assert.deepStrictEqual(references, [{ kind: 'catalog', code: 'retail' }, { kind: 'unit', code: 'piece' }]);
    await assert.rejects(SERVICE.DefaultProductFoundationService.prepareItem({ authData: authData, model: { catalogCode: 'retail', itemType: 'PRODUCT', itemCode: 'family', name: 'Family', stockManaged: true } }), error => error.code === 'ERR_PRODUCT_00010');
    await assert.rejects(SERVICE.DefaultProductFoundationService.prepareItem({ authData: { enterprise: { code: 'entB' } }, model: Object.assign({}, request.model, { code: undefined }) }), error => error.code === 'ERR_PRODUCT_00002');
    let identifier = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', identifierCode: 'phone-gtin', itemType: 'SKU', itemCode: 'phone', identifierType: 'GTIN', identifierValue: '00012345678905' } };
    await SERVICE.DefaultProductFoundationService.prepareIdentifier(identifier); assert.strictEqual(identifier.model.code, 'entA::identifier::retail::phone-gtin');
    await assert.rejects(SERVICE.DefaultProductFoundationService.rejectHardDelete(), error => error.code === 'ERR_PRODUCT_00011');
    console.log('Product P0 foundation contract validated');
})().catch(error => { console.error(error); process.exit(1); });
