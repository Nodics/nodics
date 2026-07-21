/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** Validates exact reservation holds, idempotency, insufficient stock, release, consume, expiry, CAS retry, and mutation security. */
const assert = require('assert');
const inventory = require('../config/properties').inventory;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined };
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
SERVICE.DefaultExactUnitsService = require('../../../gCore/units/src/service/exact/defaultExactUnitsService');
SERVICE.DefaultStockReservationRepositoryService = require('../src/service/reservation/defaultStockReservationRepositoryService');
const orchestration = require('../src/service/reservation/defaultStockReservationOrchestrationService');
SERVICE.DefaultStockReservationOrchestrationService = orchestration;
const intent = require('../src/service/reservation/defaultStockReservationIntentService');

let balances = [{ code: 'stockA', enterpriseCode: 'enterpriseA', warehouseCode: 'central', itemType: 'SKU', itemCode: 'phone',
    unitCode: 'EA', quantity: '10', reservedQuantity: '0', scale: 0, revision: 0 }];
let reservations = []; let conflictOnce = false; let failTerminalOnce = false; let failActivationOnce = false;
const matches = (item, query) => Object.keys(query || {}).every(key => {
    if (query[key] && query[key].$lte) return new Date(item[key]).getTime() <= new Date(query[key].$lte).getTime();
    if (query[key] && query[key].$in) return query[key].$in.includes(item[key]);
    return item[key] === query[key];
});
SERVICE.DefaultStockRepositoryService = { getBalance: async code => balances.find(item => item.code === code) };
SERVICE.DefaultStockBalanceService = { update: async request => {
    if (conflictOnce) { conflictOnce = false; balances[0].revision++; return { result: { modifiedCount: 0 } }; }
    let balance = balances.find(item => matches(item, request.query)); if (!balance) return { result: { modifiedCount: 0 } };
    Object.assign(balance, request.model); return { result: { modifiedCount: 1 } };
} };
SERVICE.DefaultStockReservationService = {
    get: async request => ({ result: reservations.filter(item => matches(item, request.query)).slice(0, request.searchOptions && request.searchOptions.limit) }),
    save: async request => { if (reservations.some(item => item.code === request.model.code)) throw new Error('duplicate');
        reservations.push(Object.assign({}, request.model)); return { result: [request.model] }; },
    update: async request => { let item = reservations.find(value => matches(value, request.query));
        if (item && failActivationOnce && request.query.state === 'PENDING' && request.model.state === 'ACTIVE') {
            failActivationOnce = false; return { result: { modifiedCount: 0 } };
        }
        if (item && failTerminalOnce && request.query.state === 'RELEASE_PENDING' && request.model.state === 'RELEASED') {
            failTerminalOnce = false; return { result: { modifiedCount: 0 } };
        }
        if (!item) return { result: { modifiedCount: 0 } }; Object.assign(item, request.model); return { result: { modifiedCount: 1 } }; }
};
const authData = { tokenType: 'service', enterprise: { code: 'enterpriseA' } };
const request = (key, quantity, ttlSeconds) => ({ tenant: 'tenantA', authData,
    reservation: { idempotencyKey: key, stockCode: 'stockA', quantity, unitCode: 'EA', reasonCode: 'CHECKOUT', ttlSeconds } });

(async () => {
    let routes = require('../src/router/routers').inventory.stockReservationIntent;
    Object.values(routes).forEach(route => { assert.strictEqual(route.secured, true);
        assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission'); assert.strictEqual(route.apiExposure, 'moduleInternal'); });
    await assert.rejects(intent.reserve({ authData: { tokenType: 'access', enterprise: { code: 'enterpriseA' } }, body: {} }),
        error => error.code === 'ERR_INV_00037');
    conflictOnce = true; failActivationOnce = true;
    await assert.rejects(orchestration.reserve(request('cart1', '3', 60)), error => error.code === 'ERR_INV_00036');
    assert.strictEqual(balances[0].reservedQuantity, '3');
    let first = await orchestration.reserve(request('cart1', '3', 60));
    assert.strictEqual(first.state, 'ACTIVE'); assert.strictEqual(balances[0].reservedQuantity, '3');
    let replay = await orchestration.reserve(request('cart1', '3', 60));
    assert.strictEqual(replay.state, 'ACTIVE'); assert.strictEqual(balances[0].reservedQuantity, '3');
    await assert.rejects(orchestration.reserve(request('cart1', '4', 60)), error => error.code === 'ERR_INV_00034');
    await assert.rejects(orchestration.reserve(request('cart2', '8', 60)), error => error.code === 'ERR_INV_00033');
    assert.strictEqual(reservations.find(item => item.idempotencyKey === 'cart2').state, 'REJECTED');
    failTerminalOnce = true;
    await assert.rejects(orchestration.release({ tenant: 'tenantA', authData, reservation: { idempotencyKey: 'cart1' } }, 'RELEASED'),
        error => error.code === 'ERR_INV_00036');
    assert.strictEqual(balances[0].reservedQuantity, '0');
    let released = await orchestration.release({ tenant: 'tenantA', authData, reservation: { idempotencyKey: 'cart1' } }, 'RELEASED');
    assert.strictEqual(released.state, 'RELEASED'); assert.strictEqual(balances[0].reservedQuantity, '0');
    await orchestration.reserve(request('cart3', '2', 60));
    let consumed = await orchestration.consume({ tenant: 'tenantA', authData, reservation: { idempotencyKey: 'cart3' } });
    assert.strictEqual(consumed.state, 'CONSUMED'); assert.strictEqual(balances[0].reservedQuantity, '2');
    await orchestration.reserve(request('cart4', '1', 1));
    reservations.find(item => item.idempotencyKey === 'cart4').expiresAt = new Date(Date.now() - 1000);
    let expiry = await orchestration.expire({ tenant: 'tenantA', authData });
    assert.strictEqual(expiry.processed, 1); assert.strictEqual(reservations.find(item => item.idempotencyKey === 'cart4').state, 'EXPIRED');
    assert.strictEqual(balances[0].reservedQuantity, '2');
    await assert.rejects(orchestration.authorizeInternalMutation({}), error => error.code === 'ERR_INV_00032');
    await assert.rejects(orchestration.rejectDelete(), error => error.code === 'ERR_INV_00032');
    console.log('Inventory Stock Reservation foundation validated');
})().catch(error => { console.error(error); process.exit(1); });
