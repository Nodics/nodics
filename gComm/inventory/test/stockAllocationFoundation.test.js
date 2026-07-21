/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** Validates multi-Warehouse allocation, backorder remainder, idempotency, fulfillment evidence, cancellation, security, and persistence guards. */
const assert = require('assert');
const inventory = require('../config/properties').inventory;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined }; global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
SERVICE.DefaultExactUnitsService = require('../../../gCore/units/src/service/exact/defaultExactUnitsService');
const allocationService = require('../src/service/allocation/defaultStockAllocationOrchestrationService');
SERVICE.DefaultStockAllocationOrchestrationService = allocationService;
const intent = require('../src/service/allocation/defaultStockAllocationIntentService');
const authData = { tokenType: 'service', enterprise: { code: 'enterpriseA' } };
let reservations = [
    { code: 'r1', enterpriseCode: 'enterpriseA', state: 'ACTIVE', itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', quantity: '3.000', warehouseCode: 'central', stockCode: 's1' },
    { code: 'r2', enterpriseCode: 'enterpriseA', state: 'ACTIVE', itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', quantity: '2.000', warehouseCode: 'west', stockCode: 's2' },
    { code: 'r3', enterpriseCode: 'enterpriseA', state: 'ACTIVE', itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', quantity: '1.000', warehouseCode: 'north', stockCode: 's3' }
];
let allocations = []; let movements = [];
const match = (item, query) => Object.keys(query || {}).every(key => query[key] && query[key].$in ? query[key].$in.includes(item[key]) : item[key] === query[key]);
SERVICE.DefaultStockReservationService = { get: async request => ({ result: reservations.filter(item => match(item, request.query)) }) };
SERVICE.DefaultStockMovementRecordService = { get: async request => ({ result: movements.filter(item => match(item, request.query)) }) };
SERVICE.DefaultStockReservationOrchestrationService = { release: async request => { let item = reservations.find(value => value.code === request.reservation.code); item.state = 'RELEASED'; return item; } };
SERVICE.DefaultStockAllocationService = {
    get: async request => ({ result: allocations.filter(item => match(item, request.query)) }),
    save: async request => { if (allocations.some(item => item.code === request.model.code)) throw new Error('duplicate'); allocations.push(JSON.parse(JSON.stringify(request.model))); return { result: [request.model] }; },
    update: async request => { let item = allocations.find(value => match(value, request.query)); if (!item) return { result: { modifiedCount: 0 } }; Object.assign(item, request.model); return { result: { modifiedCount: 1 } }; }
};
const allocateRequest = (key, requested, assignments) => ({ tenant: 'tenantA', authData, allocation: { idempotencyKey: key,
    demandType: 'ORDER', demandCode: 'order1', demandLineCode: 'line1', itemType: 'SKU', itemCode: 'phone', requestedQuantity: requested,
    unitCode: 'EA', scale: 3, reasonCode: 'ORDER_PLACED', assignments } });

(async () => {
    Object.values(require('../src/router/routers').inventory.stockAllocationIntent).forEach(route => {
        assert.strictEqual(route.secured, true); assert.strictEqual(route.apiExposure, 'moduleInternal');
        assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
    });
    await assert.rejects(intent.allocate({ authData: { tokenType: 'access' }, body: {} }), error => error.code === 'ERR_INV_00042');
    let partial = await allocationService.allocate(allocateRequest('a1', '7', [
        { reservationCode: 'r1', quantity: '3' }, { reservationCode: 'r2', quantity: '2' }
    ]));
    assert.strictEqual(partial.state, 'PARTIALLY_ALLOCATED'); assert.strictEqual(partial.allocatedQuantity, '5.000');
    assert.strictEqual(partial.backorderedQuantity, '2.000'); assert.deepStrictEqual(partial.assignments.map(value => value.warehouseCode), ['central', 'west']);
    let replay = await allocationService.allocate(allocateRequest('a1', '7', [
        { reservationCode: 'r1', quantity: '3' }, { reservationCode: 'r2', quantity: '2' }
    ])); assert.strictEqual(replay.code, partial.code);
    await assert.rejects(allocationService.allocate(allocateRequest('a1', '8', [{ reservationCode: 'r1', quantity: '3' }])), error => error.code === 'ERR_INV_00039');
    movements.push({ code: 'm1', enterpriseCode: 'enterpriseA', sourceType: 'STOCK_RESERVATION', sourceCode: 'r1', state: 'APPLIED' });
    let fulfilled = await allocationService.fulfill({ tenant: 'tenantA', authData, allocation: { code: partial.code } });
    assert.strictEqual(fulfilled.state, 'PARTIALLY_FULFILLED'); assert.strictEqual(fulfilled.fulfilledQuantity, '3.000');
    let cancellable = await allocationService.allocate(allocateRequest('a2', '1', [{ reservationCode: 'r3', quantity: '1' }]));
    let cancelled = await allocationService.close({ tenant: 'tenantA', authData, allocation: { code: cancellable.code } }, 'CANCELLED');
    assert.strictEqual(cancelled.state, 'CANCELLED'); assert.strictEqual(reservations.find(value => value.code === 'r3').state, 'RELEASED');
    await assert.rejects(allocationService.authorizeInternalMutation({}), error => error.code === 'ERR_INV_00038');
    await assert.rejects(allocationService.rejectDelete(), error => error.code === 'ERR_INV_00038');
    console.log('Inventory Stock Allocation foundation validated');
})().catch(error => { console.error(error); process.exit(1); });
