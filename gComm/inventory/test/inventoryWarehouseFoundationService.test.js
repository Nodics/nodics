/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates enterprise isolation, deterministic identities, lifecycle boundaries, hierarchy safety, and layered customization. */
const assert = require('assert');
const properties = require('../config/properties').inventory;

class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? properties : undefined };
global.SERVICE = {};

const scope = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
const warehouse = require('../src/service/foundation/defaultInventoryWarehouseFoundationService');
const location = require('../src/service/foundation/defaultInventoryWarehouseLocationFoundationService');
SERVICE.DefaultInventoryEnterpriseScopeService = scope;

const auth = { enterprise: { code: 'enterpriseA' }, tokenType: 'access' };
const request = model => ({ tenant: 'tenantA', authData: auth, model: Object.assign({}, model) });

assert.strictEqual(scope.resolveEnterpriseCode({ authData: auth }), 'enterpriseA');
assert.throws(() => scope.resolveEnterpriseCode({ authData: {} }), error => error.code === 'ERR_INV_00001');
assert.throws(() => scope.scopeQuery({ authData: auth, query: { enterpriseCode: 'enterpriseB' } }),
    error => error.code === 'ERR_INV_00002');
let scopedQuery = { authData: auth, query: { status: 'ACTIVE' } };
scope.scopeQuery(scopedQuery);
assert.deepStrictEqual(scopedQuery.query, { status: 'ACTIVE', enterpriseCode: 'enterpriseA' });

(async () => {
    let createWarehouse = request({ warehouseCode: 'dubaiCentral', name: 'Dubai Central' });
    await warehouse.prepareWarehouseSave(createWarehouse);
    assert.strictEqual(createWarehouse.model.enterpriseCode, 'enterpriseA');
    assert.strictEqual(createWarehouse.model.code, 'enterpriseA::warehouse::dubaiCentral');
    assert.strictEqual(createWarehouse.model.status, 'DRAFT');
    assert.strictEqual(createWarehouse.model.type, 'PHYSICAL');

    assert.throws(() => warehouse.prepareWarehouseSave(request({ warehouseCode: 'invalid code', name: 'Invalid' })),
        error => error.code === 'ERR_INV_00003');
    assert.throws(() => warehouse.prepareWarehouseSave(request({ warehouseCode: 'other', enterpriseCode: 'enterpriseB', name: 'Other' })),
        error => error.code === 'ERR_INV_00002');

    properties.warehouse.types.push('MICRO_FULFILLMENT');
    let customized = request({ warehouseCode: 'microOne', name: 'Micro', type: 'MICRO_FULFILLMENT' });
    await warehouse.prepareWarehouseSave(customized);
    assert.strictEqual(customized.model.type, 'MICRO_FULFILLMENT', 'later properties must extend OOTB classifications');
    properties.warehouse.types.pop();

    let warehouses = [{ code: 'enterpriseA::warehouse::dubaiCentral', enterpriseCode: 'enterpriseA',
        warehouseCode: 'dubaiCentral', name: 'Dubai Central', type: 'PHYSICAL', status: 'DRAFT' }];
    let locations = [];
    SERVICE.DefaultWarehouseService = {
        get: async input => ({ result: warehouses.filter(item => Object.keys(input.query || {}).every(key =>
            key === 'status' ? true : item[key] === input.query[key])) })
    };
    SERVICE.DefaultWarehouseLocationService = {
        get: async input => ({ result: locations.filter(item => Object.keys(input.query || {}).every(key => {
            let expected = input.query[key];
            if (expected && expected.$ne !== undefined) return item[key] !== expected.$ne;
            return item[key] === expected;
        })) })
    };

    let activate = { tenant: 'tenantA', authData: auth, query: { warehouseCode: 'dubaiCentral' }, model: { status: 'ACTIVE' } };
    await warehouse.prepareWarehouseUpdate(activate);
    assert.strictEqual(activate.query.enterpriseCode, 'enterpriseA');
    assert.strictEqual(activate.model.enterpriseCode, 'enterpriseA');

    let invalidTransition = { tenant: 'tenantA', authData: auth, query: { warehouseCode: 'dubaiCentral' }, model: { status: 'SUSPENDED' } };
    await assert.rejects(warehouse.prepareWarehouseUpdate(invalidTransition), error => error.code === 'ERR_INV_00004');
    let identityChange = { tenant: 'tenantA', authData: auth, query: { warehouseCode: 'dubaiCentral' }, model: { warehouseCode: 'renamed' } };
    await assert.rejects(warehouse.prepareWarehouseUpdate(identityChange), error => error.code === 'ERR_INV_00006');

    warehouses[0].status = 'ACTIVE';
    let rootRequest = request({ warehouseCode: 'dubaiCentral', locationCode: 'storage', name: 'Storage', type: 'ZONE' });
    await location.prepareLocationSave(rootRequest);
    assert.deepStrictEqual(rootRequest.model.path, ['storage']);
    assert.strictEqual(rootRequest.model.depth, 0);
    locations.push(Object.assign({}, rootRequest.model, { status: 'ACTIVE' }));

    let childRequest = request({ warehouseCode: 'dubaiCentral', locationCode: 'aisleA', parentLocationCode: 'storage',
        name: 'Aisle A', type: 'AISLE' });
    await location.prepareLocationSave(childRequest);
    assert.deepStrictEqual(childRequest.model.path, ['storage', 'aisleA']);
    assert.strictEqual(childRequest.model.depth, 1);
    assert.strictEqual(childRequest.model.code, 'enterpriseA::location::dubaiCentral::aisleA');
    locations.push(Object.assign({}, childRequest.model, { status: 'ACTIVE' }));

    await assert.rejects(location.prepareLocationSave(request({ warehouseCode: 'dubaiCentral', locationCode: 'self',
        parentLocationCode: 'self', name: 'Invalid', type: 'BIN' })), error => error.code === 'ERR_INV_00005');
    await assert.rejects(location.prepareLocationSave(request({ warehouseCode: 'missing', locationCode: 'binA',
        name: 'Missing warehouse', type: 'BIN' })), error => error.code === 'ERR_INV_00005');

    let priorMaxDepth = properties.location.maxDepth;
    properties.location.maxDepth = 0;
    await assert.rejects(location.prepareLocationSave(request({ warehouseCode: 'dubaiCentral', locationCode: 'tooDeep',
        parentLocationCode: 'storage', name: 'Too deep', type: 'BIN' })), error => error.code === 'ERR_INV_00005');
    properties.location.maxDepth = priorMaxDepth;

    let retireParent = { tenant: 'tenantA', authData: auth, query: { locationCode: 'storage' }, model: { status: 'RETIRED' } };
    await assert.rejects(location.prepareLocationUpdate(retireParent), error => error.code === 'ERR_INV_00005');
    let retireWarehouse = { tenant: 'tenantA', authData: auth, query: { warehouseCode: 'dubaiCentral' }, model: { status: 'RETIRED' } };
    await assert.rejects(warehouse.prepareWarehouseUpdate(retireWarehouse), error => error.code === 'ERR_INV_00008');

    await assert.rejects(warehouse.rejectHardDelete(), error => error.code === 'ERR_INV_00007');
    await assert.rejects(location.rejectHardDelete(), error => error.code === 'ERR_INV_00007');

    console.log('Inventory warehouse foundation service validated');
})().catch(error => { console.error(error); process.exit(1); });
