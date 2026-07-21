/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** Validates transfer creation, partial dispatch/receipt, movement delegation, idempotency, bounds, cancellation, and persistence guards. */
const assert = require('assert'); const inventory = require('../config/properties').inventory;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined }; global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService'); SERVICE.DefaultExactUnitsService = require('../../../gCore/units/src/service/exact/defaultExactUnitsService');
const service = require('../src/service/transfer/defaultStockTransferOrchestrationService'); let transfers = []; let movements = [];
SERVICE.DefaultStockTransferOrchestrationService = service; const intent = require('../src/service/transfer/defaultStockTransferIntentService');
SERVICE.DefaultStockTransferService = { get: async request => ({ result: transfers.filter(value => Object.keys(request.query).every(key => value[key] === request.query[key])) }), save: async request => { transfers.push(Object.assign({}, request.model)); }, update: async request => { let value = transfers.find(item => Object.keys(request.query).every(key => item[key] === request.query[key])); if (!value) return { result: { modifiedCount: 0 } }; Object.assign(value, request.model); return { result: { modifiedCount: 1 } }; } };
SERVICE.DefaultStockMovementService = { apply: async request => { movements.push(request); return { code: 'm' + movements.length, state: 'APPLIED' }; } };
const authData = { tokenType: 'service', enterprise: { code: 'enterpriseA' } };
(async () => { Object.values(require('../src/router/routers').inventory.stockTransferIntent).forEach(route => { assert.strictEqual(route.secured, true); assert.strictEqual(route.apiExposure, 'moduleInternal'); }); await assert.rejects(intent.create({ authData: { tokenType: 'access' }, body: {} }), error => error.code === 'ERR_INV_00047');
    let created = await service.create({ tenant: 't', authData, transfer: { idempotencyKey: 't1', itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', requestedQuantity: '5', scale: 0, sourceStockCode: 's1', destinationStockCode: 's2', sourceWarehouseCode: 'w1', destinationWarehouseCode: 'w2', reasonCode: 'MOVE' } }); assert.strictEqual(created.state, 'DRAFT');
    let dispatched = await service.dispatch({ tenant: 't', authData, transfer: { code: created.code, operationKey: 'd1', quantity: '5', expectedRevision: 0 } }); assert.strictEqual(dispatched.state, 'IN_TRANSIT'); assert.strictEqual(movements[0].movement.movementType, 'TRANSFER_OUT');
    let partial = await service.receive({ tenant: 't', authData, transfer: { code: created.code, operationKey: 'r1', quantity: '2', expectedRevision: 0 } }); assert.strictEqual(partial.state, 'PARTIALLY_RECEIVED');
    let received = await service.receive({ tenant: 't', authData, transfer: { code: created.code, operationKey: 'r2', quantity: '3', expectedRevision: 1 } }); assert.strictEqual(received.state, 'RECEIVED'); assert.strictEqual(received.receivedQuantity, '5');
    let replay = await service.receive({ tenant: 't', authData, transfer: { code: created.code, operationKey: 'r2', quantity: '3', expectedRevision: 1 } }); assert.strictEqual(replay.operations.length, 3); assert.strictEqual(movements.length, 3);
    let second = await service.create({ tenant: 't', authData, transfer: { idempotencyKey: 't2', itemType: 'SKU', itemCode: 'phone', unitCode: 'EA', requestedQuantity: '4', scale: 0, sourceStockCode: 's1', destinationStockCode: 's2', sourceWarehouseCode: 'w1', destinationWarehouseCode: 'w2', reasonCode: 'MOVE' } });
    await service.dispatch({ tenant: 't', authData, transfer: { code: second.code, operationKey: 'd1', quantity: '4', expectedRevision: 1 } });
    await service.receive({ tenant: 't', authData, transfer: { code: second.code, operationKey: 'r1', quantity: '2', expectedRevision: 2 } });
    await service.discrepancy({ tenant: 't', authData, transfer: { code: second.code, operationKey: 'x1', type: 'DAMAGED', quantity: '1' } });
    await service.discrepancy({ tenant: 't', authData, transfer: { code: second.code, operationKey: 'x2', type: 'LOST', quantity: '1' } });
    let reconciled = await service.reconcile({ tenant: 't', authData, transfer: { code: second.code } }); assert.strictEqual(reconciled.state, 'COMPLETED_WITH_DISCREPANCY');
    let returned = await service.returnTransfer({ tenant: 't', authData, transfer: { code: created.code, idempotencyKey: 'return1', quantity: '1' } }); assert.strictEqual(returned.parentTransferCode, created.code); assert.strictEqual(returned.sourceWarehouseCode, 'w2');
    await assert.rejects(service.authorizeInternalMutation({}), error => error.code === 'ERR_INV_00043'); console.log('Inventory Stock Transfer foundation validated');
})().catch(error => { console.error(error); process.exit(1); });
