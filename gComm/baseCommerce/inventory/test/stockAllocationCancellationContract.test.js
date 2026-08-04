/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module inventory/test/stockAllocationCancellationContract
 * @description Protects idempotent exact partial allocation cancellation and reservation-release checkpoints.
 * @layer test
 * @owner inventory
 * @override Projects may replace assignment selection while preserving exact quantities, serial identity, revisions, and recovery evidence.
 */
const assert = require('assert');
const properties = require('../config/properties');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: (key) => key === 'inventory' ? properties.inventory : key === 'units' ? { maximumScale: 18 } : undefined };
global.SERVICE = {};
SERVICE.DefaultExactUnitsService = require('../../../../gCore/units/src/service/exact/defaultExactUnitsService');
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
const orchestration = require('../src/service/allocation/defaultStockAllocationCancellationOrchestrationService');
SERVICE.DefaultStockAllocationCancellationOrchestrationService = orchestration;
const intent = require('../src/service/allocation/defaultStockAllocationIntentService');

let allocation = {
    code: 'allocation::a1', enterpriseCode: 'enterpriseA', demandCode: 'order-1', demandLineCode: 'entry-1',
    allocatedQuantity: '3.000', fulfilledQuantity: '0.000', cancelledQuantity: '0.000', unitCode: 'EA', scale: 3,
    state: 'ALLOCATED', revision: 0,
    assignments: [
        { reservationCode: 'r1', quantity: '2.000', state: 'ALLOCATED', serialNumbers: ['serial-1', 'serial-2'] },
        { reservationCode: 'r2', quantity: '1.000', state: 'ALLOCATED', serialNumbers: ['serial-3'] },
    ],
};
let operations = [];
let releaseCalls = [];
const matches = (model, query) => Object.entries(query || {}).every(([key, value]) => model[key] === value);
SERVICE.DefaultStockAllocationService = {
    get: async (request) => ({ result: matches(allocation, request.query) ? [allocation] : [] }),
    update: async (request) => {
        if (!matches(allocation, request.query)) return { result: { modifiedCount: 0 } };
        allocation = Object.assign({}, allocation, request.model); return { result: { modifiedCount: 1 } };
    },
};
SERVICE.DefaultStockAllocationCancellationService = {
    get: async (request) => ({ result: operations.filter((model) => matches(model, request.query)) }),
    save: async (request) => { operations.push(JSON.parse(JSON.stringify(request.model))); return { result: [request.model] }; },
    update: async (request) => {
        const index = operations.findIndex((model) => matches(model, request.query));
        if (index < 0) return { result: { modifiedCount: 0 } };
        operations[index] = Object.assign({}, operations[index], request.model); return { result: { modifiedCount: 1 } };
    },
};
SERVICE.DefaultStockReservationOrchestrationService = {
    releaseQuantity: async (request) => {
        releaseCalls.push(JSON.parse(JSON.stringify(request.reservation)));
        return { code: request.reservation.code, state: request.reservation.quantity === '2.000' ? 'CANCELLED' : 'PARTIALLY_RELEASED' };
    },
};

const request = (code, quantity, version, serialNumbers) => ({
    tenant: 'tenantA', authData: { tokenType: 'service', enterprise: { code: 'enterpriseA' } },
    body: { cancellationCode: code, allocationCode: 'allocation::a1', requestVersion: version,
        quantity: quantity, unitCode: 'EA', serialNumbers: serialNumbers || [] },
});

(async () => {
    const first = await intent.cancelQuantity(request('cancel-1-v2', '1', 2));
    assert.strictEqual(first.code, 'SUC_INV_00009');
    assert.strictEqual(first.data.state, 'COMPLETED');
    assert.strictEqual(allocation.state, 'PARTIALLY_CANCELLED');
    assert.strictEqual(allocation.cancelledQuantity, '1.000');
    assert.strictEqual(allocation.assignments[0].remainingQuantity, '1.000');
    assert.strictEqual(releaseCalls[0].releaseKey, 'cancel-1-v2::r1');

    const replay = await intent.cancelQuantity(request('cancel-1-v2', '1', 2));
    assert.strictEqual(replay.data.idempotent, true);
    assert.strictEqual(releaseCalls.length, 1, 'completed replay must not release Reservation twice');

    const final = await intent.cancelQuantity(request('cancel-1-v3', '2', 3));
    assert.strictEqual(final.data.state, 'COMPLETED');
    assert.strictEqual(allocation.state, 'CANCELLED');
    assert.strictEqual(allocation.cancelledQuantity, '3.000');
    assert.strictEqual(allocation.revision, 2);

    await assert.rejects(intent.cancelQuantity({ authData: { tokenType: 'access' }, body: {} }), (error) => error.code === 'ERR_INV_00042');

    allocation = {
        code: 'allocation::a1', enterpriseCode: 'enterpriseA', demandCode: 'order-2', demandLineCode: 'entry-2',
        allocatedQuantity: '2', fulfilledQuantity: '0', cancelledQuantity: '0', unitCode: 'EA', scale: 0,
        state: 'ALLOCATED', revision: 0,
        assignments: [{ reservationCode: 'serialized-r1', quantity: '2', state: 'ALLOCATED', serialNumbers: ['serial-a', 'serial-b'] }],
    };
    operations = []; releaseCalls = [];
    const serialized = await intent.cancelQuantity(request('cancel-serial-v1', '1', 1, ['serial-b']));
    assert.deepStrictEqual(serialized.data.assignmentPlan[0].serialNumbers, ['serial-b']);
    assert.strictEqual(releaseCalls[0].quantity, '1');

    const routes = require('../src/router/routers').inventory.stockAllocationIntent;
    assert.strictEqual(routes.cancelAllocationQuantity.apiExposure, 'moduleInternal');
    assert.strictEqual(routes.cancelAllocationQuantity.permissionConfig, 'authSecurity.internalToken.routePermission');
    assert.strictEqual(require('../src/schemas/schemas').inventory.stockAllocationCancellation.router.enabled, false);

    let reservation = { code: 'reservation-1', stockCode: 'stock-1', quantity: '3.000', releasedQuantity: '0.000',
        remainingQuantity: '3.000', unitCode: 'EA', scale: 3, state: 'ACTIVE' };
    let balance = { code: 'stock-1', stockCode: 'stock-1', quantity: '10.000', reservedQuantity: '3.000',
        unitCode: 'EA', scale: 3, revision: 0 };
    SERVICE.DefaultStockReservationRepositoryService = {
        getReservation: async () => reservation,
        transition: async (current, expectedState, state, patch) => {
            if (reservation.state !== expectedState) return reservation;
            reservation = Object.assign({}, reservation, patch || {}, { state: state }); return reservation;
        },
        applyReservedQuantity: async (currentBalance, reservationCode, quantity) => {
            if (currentBalance.revision !== balance.revision) return null;
            balance = Object.assign({}, balance, { reservedQuantity: quantity, revision: balance.revision + 1, lastReservationCode: reservationCode });
            return balance;
        },
    };
    SERVICE.DefaultStockRepositoryService = { getBalance: async () => balance };
    const reservationOrchestration = require('../src/service/reservation/defaultStockReservationOrchestrationService');
    const partialReservationRequest = (releaseKey, quantity) => ({ tenant: 'tenantA', authData: { tokenType: 'service', enterprise: { code: 'enterpriseA' } },
        reservation: { code: 'reservation-1', releaseKey: releaseKey, quantity: quantity } });
    const partialReservation = await reservationOrchestration.releaseQuantity(partialReservationRequest('cancel-quantity-1', '1'));
    assert.strictEqual(partialReservation.state, 'PARTIALLY_RELEASED');
    assert.strictEqual(partialReservation.remainingQuantity, '2.000');
    assert.strictEqual(balance.reservedQuantity, '2.000');
    await reservationOrchestration.releaseQuantity(partialReservationRequest('cancel-quantity-1', '1'));
    assert.strictEqual(balance.reservedQuantity, '2.000', 'Reservation replay must not decrement Stock Balance twice');
    const finalReservation = await reservationOrchestration.releaseQuantity(partialReservationRequest('cancel-quantity-2', '2'));
    assert.strictEqual(finalReservation.state, 'CANCELLED');
    assert.strictEqual(finalReservation.remainingQuantity, '0.000');
    assert.strictEqual(balance.reservedQuantity, '0.000');

    console.log('Inventory Stock Allocation cancellation contract validated');
})().catch((error) => { console.error(error); process.exit(1); });
