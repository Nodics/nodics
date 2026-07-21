/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/test/stockReconciliationFoundation @description Validates bounded cross-evidence scanning, approval separation, and movement-only repair. @layer test @owner inventory */
const assert = require('assert'); const inventory = require('../config/properties').inventory; class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'inventory' ? inventory : undefined }; global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require('../src/service/foundation/defaultInventoryEnterpriseScopeService'); SERVICE.DefaultExactUnitsService = require('../../../gCore/units/src/service/exact/defaultExactUnitsService'); const service = require('../src/service/reconciliation/defaultStockReconciliationService');
let runs = []; let findings = []; const match = (item, query) => Object.keys(query || {}).every(key => query[key] && query[key].$in ? query[key].$in.includes(item[key]) : item[key] === query[key]); const crud = list => ({ get: async request => ({ result: list.filter(value => match(value, request.query)) }), save: async request => { list.push(Object.assign({}, request.model)); }, update: async request => { let value = list.find(item => match(item, request.query)); if (!value) return { result: { modifiedCount: 0 } }; Object.assign(value, request.model); return { result: { modifiedCount: 1 } }; } });
SERVICE.DefaultStockReconciliationRunService = crud(runs); SERVICE.DefaultStockReconciliationFindingService = crud(findings);
SERVICE.DefaultStockBalanceService = { get: async () => ({ result: [{ code: 's1', enterpriseCode: 'e1', quantity: '-2', reservedQuantity: '1', scale: 0, revision: 3, warehouseCode: 'w1', itemType: 'SKU', itemCode: 'p1', unitCode: 'EA' }] }) };
SERVICE.DefaultStockReservationService = { get: async request => request.query.stockCode ? ({ result: [{ stockCode: 's1', state: 'ACTIVE', quantity: '2' }] }) : ({ result: [{ code: 'rPending', state: 'PENDING', createdAt: new Date(0) }] }) };
SERVICE.DefaultStockAllocationService = { get: async () => ({ result: [{ code: 'a1', requestedQuantity: '5', allocatedQuantity: '4', backorderedQuantity: '0', fulfilledQuantity: '5', scale: 0, assignments: [{ quantity: '3' }] }] }) };
SERVICE.DefaultStockTransferService = { get: async () => ({ result: [{ code: 't1', requestedQuantity: '5', dispatchedQuantity: '6', receivedQuantity: '7', damagedQuantity: '0', lostQuantity: '0', scale: 0 }] }) };
SERVICE.DefaultStockMovementRecordService = { get: async () => ({ result: [{ code: 'mPending', state: 'PENDING' }] }) };
let repair; SERVICE.DefaultStockMovementService = { apply: async request => { repair = request; return { code: 'repairMovement' }; } };
const serviceAuth = { tokenType: 'service', enterprise: { code: 'e1' } }; const humanAuth = { tokenType: 'access', enterprise: { code: 'e1' }, principalId: 'operator1' };
(async () => { let result = await service.scan({ tenant: 't', authData: serviceAuth, reconciliation: { idempotencyKey: 'run1' } }); assert.strictEqual(result.dryRun, true); assert.strictEqual(result.state, 'COMPLETED'); assert.strictEqual(result.findingCount, 6); ['RESERVED_QUANTITY_MISMATCH', 'NEGATIVE_BALANCE', 'ALLOCATION_QUANTITY_MISMATCH', 'TRANSFER_QUANTITY_MISMATCH', 'PENDING_MOVEMENT', 'STALE_RESERVATION_TRANSITION'].forEach(type => assert(findings.some(value => value.type === type), type)); let negative = findings.find(value => value.type === 'NEGATIVE_BALANCE'); await assert.rejects(service.approve({ authData: serviceAuth, reconciliation: { code: negative.code } }), error => error.code === 'ERR_INV_00051'); await service.approve({ tenant: 't', authData: humanAuth, reconciliation: { code: negative.code, note: 'Approved correction' } }); let repaired = await service.repair({ tenant: 't', authData: serviceAuth, reconciliation: { code: negative.code } }); assert.strictEqual(repaired.state, 'RESOLVED'); assert.strictEqual(repair.movement.movementType, 'CORRECTION'); assert.strictEqual(repair.movement.quantity, '2'); await assert.rejects(service.authorizeMutation({}), error => error.code === 'ERR_INV_00048'); console.log('Inventory Stock Reconciliation foundation validated'); })().catch(error => { console.error(error); process.exit(1); });
