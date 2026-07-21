/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates exact Stock receipt/issue, idempotency, CAS, negative-stock rejection, recovery, and persistence boundaries. */
const assert = require('assert');
const inventory = require('../config/properties').inventory;
const units = require('../../../gCore/units/config/properties').units;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'inventory' ? inventory : key === 'units' ? units : undefined };
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService');
SERVICE.DefaultExactUnitsService = require('../../../gCore/units/src/service/exact/defaultExactUnitsService');
SERVICE.DefaultUnitsConversionPolicyService = require('../../../gCore/units/src/service/conversion/defaultUnitsConversionPolicyService');
SERVICE.DefaultStockRepositoryService = require('../src/service/stock/defaultStockRepositoryService');
SERVICE.DefaultInventoryUnitsReferenceProviderService = {
    convert: async (request, input) => ({ quantity: input.fromUnitCode === 'G' && input.toUnitCode === 'KG' ?
        SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, '1', '1000', input.targetScale, input.roundingMode) :
        SERVICE.DefaultExactUnitsService.multiplyRational(input.quantity, '1', '1', input.targetScale, input.roundingMode),
    fromUnit: { unitCode: input.fromUnitCode, dimensionVector: { MASS: 1 } },
    toUnit: { unitCode: input.toUnitCode, dimensionVector: { MASS: 1 } },
    conversion: input.fromUnitCode === input.toUnitCode ? null : { conversionCode: 'G_TO_KG' } })
};
const movementService = require('../src/service/stock/defaultStockMovementService');
SERVICE.DefaultStockMovementService = movementService;

let balances = []; let movements = [];
const match = (item, query) => Object.keys(query || {}).every(key => item[key] === query[key]);
SERVICE.DefaultWarehouseService = { get: async () => ({ result: [{ warehouseCode: 'central', status: 'ACTIVE' }] }) };
SERVICE.DefaultWarehouseLocationService = { get: async () => ({ result: [{ locationCode: 'binA', status: 'ACTIVE' }] }) };
SERVICE.DefaultUnitOfMeasureService = { get: async () => ({ result: [{ unitCode: 'KG', status: 'ACTIVE', dimensionVector: { MASS: 1 } }] }) };
SERVICE.DefaultStockBalanceService = {
    get: async request => ({ result: balances.filter(item => match(item, request.query)) }),
    save: async request => { if (balances.some(item => item.code === request.model.code)) throw new Error('duplicate'); balances.push(Object.assign({}, request.model)); return { result: [request.model] }; },
    update: async request => { let item = balances.find(value => match(value, request.query)); if (!item) return { result: { modifiedCount: 0 } }; Object.assign(item, request.model); return { result: { modifiedCount: 1 } }; }
};
SERVICE.DefaultStockMovementRecordService = {
    get: async request => ({ result: movements.filter(item => match(item, request.query)) }),
    save: async request => { if (movements.some(item => item.code === request.model.code)) throw new Error('duplicate'); movements.push(Object.assign({}, request.model)); return { result: [request.model] }; },
    update: async request => { let item = movements.find(value => match(value, request.query)); if (!item) return { result: { modifiedCount: 0 } }; Object.assign(item, request.model); return { result: { modifiedCount: 1 } }; }
};
let reservationRecords = [];
SERVICE.DefaultStockReservationService = { get: async request => ({ result: reservationRecords.filter(item => match(item, request.query)) }) };
const authData = { enterprise: { code: 'enterpriseA' }, principalId: 'operatorA' };
const request = (id, quantity, expected, type) => ({ tenant: 'tenantA', authData: authData,
    stock: { warehouseCode: 'central', locationCode: 'binA', itemType: 'SKU', itemCode: 'rice', unitCode: 'KG', scale: 3 },
    movement: { idempotencyKey: id, movementType: type, quantity: quantity, expectedRevision: expected, reasonCode: 'TEST' } });

(async () => {
    let receipt = await movementService.apply(request('receipt1', '10.250', 0, 'RECEIPT'));
    assert.strictEqual(receipt.state, 'APPLIED'); assert.strictEqual(receipt.resultingQuantity, '10.250');
    let conversion = SERVICE.DefaultInventoryUnitsReferenceProviderService.convert;
    SERVICE.DefaultInventoryUnitsReferenceProviderService.convert = async () => { throw new Error('Units unavailable'); };
    let replay = await movementService.apply(request('receipt1', '10.250', 0, 'RECEIPT'));
    assert.strictEqual(replay.resultingQuantity, '10.250'); assert.strictEqual(balances[0].quantity, '10.250');
    await assert.rejects(movementService.apply(request('receipt1', '10.251', 0, 'RECEIPT')), error => error.code === 'ERR_INV_00012');
    SERVICE.DefaultInventoryUnitsReferenceProviderService.convert = conversion;
    let issue = await movementService.apply(request('issue1', '-0.125', 1, 'ISSUE'));
    assert.strictEqual(issue.resultingQuantity, '10.125'); assert.strictEqual(balances[0].revision, 2);
    let grams = request('grams1', '1000', 2, 'RECEIPT'); grams.movement.unitCode = 'G';
    let converted = await movementService.apply(grams);
    assert.strictEqual(converted.normalizedDelta, '1.000'); assert.strictEqual(converted.resultingQuantity, '11.125');
    assert.strictEqual(converted.originalUnitCode, 'G'); assert.strictEqual(converted.conversionCode, 'G_TO_KG');
    await assert.rejects(movementService.apply(request('stale', '1.000', 2, 'RECEIPT')), error => error.code === 'ERR_INV_00013');
    assert.strictEqual(movements.find(item => item.idempotencyKey === 'stale').state, 'REJECTED');
    assert.strictEqual(movements.find(item => item.idempotencyKey === 'stale').failureCode, 'REVISION_CONFLICT');
    await assert.rejects(movementService.apply(request('tooMuch', '-20.000', 3, 'ISSUE')), error => error.code === 'ERR_INV_00014');
    assert.strictEqual(movements.find(item => item.idempotencyKey === 'tooMuch').state, 'REJECTED');
    assert.strictEqual(balances[0].quantity, '11.125');
    let rejectedReplay = await movementService.apply(request('tooMuch', '-20.000', 3, 'ISSUE'));
    assert.strictEqual(rejectedReplay.state, 'REJECTED'); assert.strictEqual(balances[0].quantity, '11.125');
    balances[0].reservedQuantity = '2.000'; reservationRecords.push({ code: 'reservation1', enterpriseCode: 'enterpriseA', state: 'CONSUMED',
        stockCode: balances[0].code, quantity: '2.000', unitCode: 'KG' });
    let fulfillment = request('fulfill1', '-2.000', 3, 'ISSUE');
    fulfillment.movement.sourceType = 'STOCK_RESERVATION'; fulfillment.movement.sourceCode = 'reservation1';
    let fulfilled = await movementService.apply(fulfillment);
    assert.strictEqual(fulfilled.state, 'APPLIED'); assert.strictEqual(balances[0].quantity, '9.125');
    assert.strictEqual(balances[0].reservedQuantity, '0.000'); assert.strictEqual(balances[0].lastReservationCode, 'reservation1');
    await assert.rejects(movementService.authorizeInternalMutation({}), error => error.code === 'ERR_INV_00011');
    await assert.rejects(movementService.rejectDelete(), error => error.code === 'ERR_INV_00011');
    console.log('Inventory Stock Movement core validated');
})().catch(error => { console.error(error); process.exit(1); });
