/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/test/productLifecycleCancellationContract @description Protects idempotent provider-neutral entitlement cancellation delegation. @layer test @owner product */
const assert = require('assert'); const properties = require('../config/properties'); properties.product.lifecycleCancellation.providerAdapters.REVOKE_LICENSE = 'LicenseAdapter'; global.CONFIG = { get: key => key === 'product' ? properties.product : undefined }; let called;
global.SERVICE = {
    LicenseAdapter: { cancel: async request => { called = request; return { status: 'REVOKED', providerReference: 'provider-ref-1' }; } },
    DefaultProductEnterpriseScopeService: { error: (code, message) => { let error = new Error(message); error.code = code; return error; } },
};
const service = require('../src/service/reference/defaultProductLifecycleCancellationService');
const cancellationEvidence = require('../src/service/reference/defaultOrderCancellationProductEvidenceProviderService');
const returnEvidence = require('../src/service/reference/defaultOrderReturnProductEvidenceProviderService');
(async () => { let result = await service.execute({ tenant: 'default', authData: { tokenType: 'service' }, productLifecycleCancellation: { cancellationCode: 'cancel-1', requestVersion: 2, orderCode: 'order-1', orderEntryCode: 'entry-1', lifecycleType: 'LICENSE', entitlementReference: 'license-1', providerActionRequired: true, providerActionCode: 'REVOKE_LICENSE' } }); assert.strictEqual(result.status, 'REVOKED'); assert.strictEqual(called.idempotencyKey, 'cancel-1::2::entry-1::REVOKE_LICENSE'); let none = await service.execute({ tenant: 'default', authData: { tokenType: 'service' }, productLifecycleCancellation: { cancellationCode: 'cancel-2', requestVersion: 1, orderEntryCode: 'entry-2', lifecycleType: 'DIGITAL', providerActionRequired: false } }); assert.strictEqual(none.status, 'NO_PRODUCT_PROVIDER_ACTION_REQUIRED');
    assert(properties.product.lifecycleCancellation.supportedLifecycleTypes.includes('PREORDER'));
    assert(properties.product.lifecycleCancellation.supportedLifecycleTypes.includes('DROP_SHIP'));
    assert(properties.product.lifecycleCancellation.supportedLifecycleTypes.includes('MADE_TO_ORDER'));
    SERVICE.DefaultProductItemService = { get: async request => ({ result: [{ status: 'ACTIVE', lifecycleType: request.query.itemCode === 'infinite' ? 'INFINITE_INVENTORY' : request.query.itemCode === 'unknown' ? 'UNKNOWN_TYPE' : 'DROP_SHIP', cancellationAllowed: true, returnAllowed: true }] }) };
    let context = { tenant: 'default', authData: { tokenType: 'service' }, entCode: 'ent-1', orderCode: 'order-1', items: [{ orderEntryCode: 'entry-drop', immutableEvidence: { catalogCode: 'catalog', itemType: 'SKU', itemCode: 'drop' } }] };
    let dropShip = await cancellationEvidence.resolve(context);
    assert.strictEqual(dropShip.items[0].lifecycleType, 'DROP_SHIP');
    assert.strictEqual(dropShip.items[0].physicalInventoryRequired, true);
    let infinite = await returnEvidence.resolve(Object.assign({}, context, { items: [{ orderEntryCode: 'entry-infinite', immutableEvidence: { catalogCode: 'catalog', itemType: 'SKU', itemCode: 'infinite' } }] }));
    assert.strictEqual(infinite.items[0].physicalReturnRequired, false);
    await assert.rejects(() => cancellationEvidence.resolve(Object.assign({}, context, { items: [{ orderEntryCode: 'entry-unknown', immutableEvidence: { catalogCode: 'catalog', itemType: 'SKU', itemCode: 'unknown' } }] })), /lifecycle type is unsupported/);
    console.log('Product lifecycle cancellation contract validated'); })().catch(error => { console.error(error); process.exit(1); });
