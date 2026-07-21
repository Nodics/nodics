/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates Store enterprise isolation, lifecycle, Inventory references, boundaries, and layered customization. */
const assert = require('assert');
const properties = require('../config/properties').store;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'store' ? properties : undefined };
global.SERVICE = {};

const scope = require('../src/service/foundation/defaultStoreEnterpriseScopeService');
const storeService = require('../src/service/foundation/defaultStoreFoundationService');
const assignmentService = require('../src/service/foundation/defaultStoreWarehouseAssignmentFoundationService');
const warehouseReferenceProvider = require('../src/service/reference/defaultStoreWarehouseReferenceProviderService');
SERVICE.DefaultStoreEnterpriseScopeService = scope;
SERVICE.DefaultStoreWarehouseReferenceProviderService = warehouseReferenceProvider;
const auth = { enterprise: { code: 'enterpriseA' } };
const request = model => ({ tenant: 'tenantA', authData: auth, model: Object.assign({}, model) });

assert.throws(() => scope.resolveEnterpriseCode({ authData: {} }), error => error.code === 'ERR_STORE_00001');
assert.throws(() => scope.scopeQuery({ authData: auth, query: { enterpriseCode: 'enterpriseB' } }),
    error => error.code === 'ERR_STORE_00002');

(async () => {
    let create = request({ storeCode: 'dubaiMall', name: 'Dubai Mall' });
    await storeService.prepareStoreSave(create);
    assert.strictEqual(create.model.code, 'enterpriseA::store::dubaiMall');
    assert.strictEqual(create.model.type, 'PHYSICAL');
    assert.strictEqual(create.model.status, 'DRAFT');
    assert.throws(() => storeService.prepareStoreSave(request({ storeCode: 'bad code', name: 'Bad' })),
        error => error.code === 'ERR_STORE_00003');

    properties.store.types.push('MOBILE_STORE');
    let customized = request({ storeCode: 'mobileOne', name: 'Mobile', type: 'MOBILE_STORE' });
    await storeService.prepareStoreSave(customized);
    assert.strictEqual(customized.model.type, 'MOBILE_STORE');
    properties.store.types.pop();

    let stores = [{ code: create.model.code, enterpriseCode: 'enterpriseA', storeCode: 'dubaiMall', name: 'Dubai Mall',
        type: 'PHYSICAL', status: 'ACTIVE' }];
    let warehouses = [{ enterpriseCode: 'enterpriseA', warehouseCode: 'central', status: 'ACTIVE' }];
    let assignments = [];
    const matches = (item, query) => Object.keys(query || {}).every(key => {
        let expected = query[key]; if (expected && expected.$ne !== undefined) return item[key] !== expected.$ne;
        return item[key] === expected;
    });
    SERVICE.DefaultStoreService = { get: async input => ({ result: stores.filter(item => matches(item, input.query)) }) };
    SERVICE.DefaultWarehouseService = { get: async input => ({ result: warehouses.filter(item => matches(item, input.query)) }) };
    SERVICE.DefaultStoreWarehouseAssignmentService = { get: async input => ({ result: assignments.filter(item => matches(item, input.query)) }) };

    let assignment = request({ storeCode: 'dubaiMall', warehouseCode: 'central', purposes: ['FULFILLMENT', 'PICKUP'], priority: 10 });
    await assignmentService.prepareAssignmentSave(assignment);
    assert.strictEqual(assignment.model.code, 'enterpriseA::storeWarehouse::dubaiMall::central');
    assert.strictEqual(assignment.model.status, 'DRAFT');

    await assert.rejects(assignmentService.prepareAssignmentSave(request({ storeCode: 'dubaiMall', warehouseCode: 'missing',
        purposes: ['FULFILLMENT'] })), error => error.code === 'ERR_STORE_00005');
    await assert.rejects(assignmentService.prepareAssignmentSave(request({ storeCode: 'dubaiMall', warehouseCode: 'central',
        purposes: ['UNKNOWN'] })), error => error.code === 'ERR_STORE_00003');
    await assert.rejects(assignmentService.prepareAssignmentSave(request({ storeCode: 'dubaiMall', warehouseCode: 'central',
        purposes: ['FULFILLMENT'], priority: -1 })), error => error.code === 'ERR_STORE_00003');

    properties.warehouseAssignment.purposes.push('SERVICE');
    let customPurpose = request({ storeCode: 'dubaiMall', warehouseCode: 'central', purposes: ['SERVICE'] });
    await assignmentService.prepareAssignmentSave(customPurpose);
    properties.warehouseAssignment.purposes.pop();

    assignments.push(Object.assign({}, assignment.model, { status: 'ACTIVE' }));
    let retireStore = { tenant: 'tenantA', authData: auth, query: { storeCode: 'dubaiMall' }, model: { status: 'RETIRED' } };
    await assert.rejects(storeService.prepareStoreUpdate(retireStore), error => error.code === 'ERR_STORE_00008');
    let identityChange = { tenant: 'tenantA', authData: auth, query: { storeCode: 'dubaiMall' }, model: { storeCode: 'renamed' } };
    await assert.rejects(storeService.prepareStoreUpdate(identityChange), error => error.code === 'ERR_STORE_00006');
    let invalidAssignmentTransition = { tenant: 'tenantA', authData: auth,
        query: { storeCode: 'dubaiMall', warehouseCode: 'central' }, model: { status: 'DRAFT' } };
    await assert.rejects(assignmentService.prepareAssignmentUpdate(invalidAssignmentTransition), error => error.code === 'ERR_STORE_00004');

    warehouses[0].enterpriseCode = 'enterpriseB';
    await assert.rejects(assignmentService.prepareAssignmentSave(request({ storeCode: 'dubaiMall', warehouseCode: 'central',
        purposes: ['FULFILLMENT'] })), error => error.code === 'ERR_STORE_00005');

    await assert.rejects(storeService.rejectHardDelete(), error => error.code === 'ERR_STORE_00007');
    await assert.rejects(assignmentService.rejectHardDelete(), error => error.code === 'ERR_STORE_00007');
    console.log('Store foundation service validated');
})().catch(error => { console.error(error); process.exit(1); });
