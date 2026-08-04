/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/test/fulfillmentConsignmentCancellationContract
 * @description Protects exact idempotent pre-shipment consignment cancellation with serial and revision evidence.
 * @layer test
 * @owner fulfillment
 * @override Projects may replace assignment selection while preserving unshipped-state guards, checkpoints, exact quantities, and safe recovery.
 */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: (key) => key === 'fulfillment' ? properties.fulfillment : key === 'units' ? { maximumScale: 18 } : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error {
    constructor(first, second, third) { super(String(third ? first : second || first)); this.code = third || first; }
} };
global.SERVICE = {};
SERVICE.DefaultExactUnitsService = require('../../../../gCore/units/src/service/exact/defaultExactUnitsService');
const cancellation = require('../src/service/release/defaultFulfillmentConsignmentCancellationOrchestrationService');
const policy = require('../src/service/policy/defaultFulfillmentPolicyService');

let consignment;
let operations;
const match = (model, query) => Object.entries(query || {}).every(([key, value]) => model[key] === value);
const reset = (serialized) => {
    consignment = {
        enterpriseCode: 'enterpriseA', consignmentCode: 'consignment-1', orderCode: 'order-1', status: 'RELEASED', revision: 0,
        allocationCodes: ['delivery-allocation-1'], inventoryAllocationCodes: ['inventory-allocation-1'],
        allocationEvidence: [{ allocationCode: 'delivery-allocation-1', entryCode: 'entry-1', quantity: serialized ? '2' : '3.000',
            unitCode: 'EA', serialNumbers: serialized ? ['serial-1', 'serial-2'] : [], inventoryAllocationCode: 'inventory-allocation-1' }],
        cancelledAllocationEvidence: [],
    };
    operations = [];
};
reset(false);
SERVICE.DefaultFulfillmentConsignmentService = {
    get: async (request) => ({ result: match(consignment, request.query) ? [consignment] : [] }),
    update: async (request) => {
        if (!match(consignment, request.query)) return { result: { modifiedCount: 0 } };
        consignment = Object.assign({}, consignment, request.model); return { result: { modifiedCount: 1 } };
    },
};
SERVICE.DefaultFulfillmentConsignmentCancellationService = {
    get: async (request) => ({ result: operations.filter(model => match(model, request.query)) }),
    save: async (request) => { operations.push(JSON.parse(JSON.stringify(request.model))); return { result: [request.model] }; },
    update: async (request) => {
        const index = operations.findIndex(model => match(model, request.query));
        if (index < 0) return { result: { modifiedCount: 0 } };
        operations[index] = Object.assign({}, operations[index], request.model); return { result: { modifiedCount: 1 } };
    },
};

const request = (code, quantity, version, serialNumbers) => ({
    tenant: 'tenantA', authData: { tokenType: 'service', principalId: 'workflow' },
    body: { enterpriseCode: 'enterpriseA', cancellationCode: code, orderCode: 'order-1', requestVersion: version,
        items: [{ orderEntryCode: 'entry-1', requestedQuantity: quantity, unitCode: 'EA', serialNumbers: serialNumbers || [] }] },
});

(async () => {
    const draft = policy.buildConsignmentDraft({ entCode: 'enterpriseA', orderCode: 'order-1', idempotencyKey: 'placement-1' },
        { deliveryGroupCode: 'delivery-group-1' }, [{ allocationCode: 'delivery-allocation-1', entryCode: 'entry-1', quantity: '3', unitCode: 'EA', serialNumbers: [] }]);
    assert.strictEqual(draft.allocationEvidence[0].quantity, '3');
    assert.strictEqual(draft.revision, 0);

    const partial = await cancellation.cancel(request('cancel-1-v2', '1', 2));
    assert.strictEqual(partial.status, 'COMPLETED');
    assert.strictEqual(consignment.status, 'PARTIALLY_CANCELLED');
    assert.strictEqual(consignment.cancelledAllocationEvidence[0].quantity, '1.000');
    assert.strictEqual(consignment.revision, 1);

    const replay = await cancellation.cancel(request('cancel-1-v2', '1', 2));
    assert.strictEqual(replay.idempotent, true);
    assert.strictEqual(consignment.revision, 1);

    const completed = await cancellation.cancel(request('cancel-1-v3', '2', 3));
    assert.strictEqual(completed.status, 'COMPLETED');
    assert.strictEqual(consignment.status, 'CANCELLED');
    assert.strictEqual(consignment.cancelledAllocationEvidence[0].quantity, '3.000');
    assert.strictEqual(consignment.revision, 2);

    reset(false);
    consignment.shipmentCode = 'shipment-1';
    await assert.rejects(cancellation.cancel(request('cancel-shipped', '1', 2)), (error) => error.code === 'ERR_FUL_00011');

    reset(true);
    const serialized = await cancellation.cancel(request('cancel-serial', '1', 2, ['serial-2']));
    assert.deepStrictEqual(serialized.cancellationPlan[0].serialNumbers, ['serial-2']);
    assert.strictEqual(consignment.status, 'PARTIALLY_CANCELLED');
    await assert.rejects(cancellation.cancel(request('cancel-same-serial', '1', 3, ['serial-2'])), (error) => error.code === 'ERR_FUL_00011');

    reset(true);
    await assert.rejects(cancellation.cancel(request('cancel-unknown-serial', '1', 2, ['serial-x'])), (error) => error.code === 'ERR_FUL_00011');
    await assert.rejects(cancellation.cancel({ authData: { tokenType: 'access' }, body: {} }), (error) => error.code === 'ERR_FUL_00010');

    const schemas = require('../src/schemas/schemas').fulfillment;
    assert.strictEqual(schemas.fulfillmentConsignmentCancellation.router.enabled, false);
    assert.strictEqual(schemas.fulfillmentConsignment.definition.allocationEvidence.type, 'array');
    const route = require('../src/router/routers').fulfillment.cancellationIntent.cancelQuantity;
    assert.strictEqual(route.apiExposure, 'moduleInternal');
    assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');

    console.log('Fulfillment Consignment cancellation contract validated');
})().catch((error) => { console.error(error); process.exit(1); });
