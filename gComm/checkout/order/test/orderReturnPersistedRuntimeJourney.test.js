/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
const orderProperties = require('../config/properties').order;
const fulfillmentProperties = require('../../../fulfillment/fulfillmentCore/config/properties').fulfillment;
const inventoryProperties = require('../../../baseCommerce/inventory/config/properties').inventory;
const orderOrchestration = require('../src/service/lifecycle/defaultOrderLifecycleOrchestrationService');
const orderReturnWorkflow = require('../src/service/lifecycle/defaultOrderReturnWorkflowService');
const returnRequest = require('../../../fulfillment/fulfillmentCore/src/service/return/defaultReturnRequestService');
const warehouse = require('../../../fulfillment/fulfillmentCore/src/service/return/defaultWarehouseReturnOperationsService');
const fulfillmentPolicy = require('../../../fulfillment/fulfillmentCore/src/service/policy/defaultFulfillmentPolicyService');
const receiptDisposition = require('../../../fulfillment/fulfillmentCore/src/service/return/defaultReturnReceiptDispositionService');
const fulfillmentEvents = require('../../../fulfillment/fulfillmentCore/src/service/return/defaultFulfillmentReturnEventService');
const fulfillmentGraph = require('../../../fulfillment/fulfillmentCore/src/pipelines/pipelines').returnReceiptDispositionPipeline;
const inventoryDisposition = require('../../../baseCommerce/inventory/src/service/return/defaultReturnDispositionMovementService');
const orderReturnOutcome = require('../src/service/lifecycle/defaultOrderReturnOutcomeService');
const orderAudit = require('../src/service/lifecycle/defaultOrderLifecycleAuditService');
const orderEvents = require('../src/service/lifecycle/defaultOrderLifecycleEventService');

const matches = (row, query) => Object.entries(query || {}).every(([key, value]) => row[key] === value);
const repository = (rows, identity) => ({
  get: async request => ({ result: rows.filter(row => matches(row, request.query)).slice(0, request.searchOptions && request.searchOptions.limit || rows.length) }),
  save: async request => { const index = rows.findIndex(row => row[identity] === request.model[identity]); if (index >= 0) rows[index] = Object.assign({}, request.model); else rows.push(Object.assign({}, request.model)); return { result: [index >= 0 ? rows[index] : rows[rows.length - 1]] }; },
  update: async request => { const row = rows.find(item => matches(item, request.query)); if (!row) return { modifiedCount: 0 }; Object.assign(row, request.model); return { modifiedCount: 1 }; },
});
const runCallbackPipeline = async (graph, request, service) => {
  const response = {}; let nodeName = graph.startNode;
  while (nodeName) {
    const node = graph.nodes[nodeName], method = node.handler.split('.').pop();
    const outcome = await new Promise((resolve, reject) => { const process = { nextSuccess: () => resolve({ branch: 'success' }), error: (a, b, error) => resolve({ branch: 'error', error }), resolve: result => resolve({ terminal: true, result }), reject }; Promise.resolve(service[method](request, response, process)).catch(reject); });
    if (outcome.terminal) return outcome.result;
    if (outcome.branch === 'error') { response.error = outcome.error; nodeName = graph.handleError; } else nodeName = node.success;
  }
};
const exactUnits = { parse: value => { const parts = String(value).split('.'); return { unscaled: BigInt(parts.join('')), scale: (parts[1] || '').length }; }, format: (unscaled, scale) => { const value = String(unscaled).padStart(scale + 1, '0'); return scale ? `${value.slice(0, -scale) || '0'}.${value.slice(-scale)}` : value; } };

describe('Order and Fulfillment persisted Return/RMA runtime journey', function () {
  const originals = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  let stores; let events; let movements;
  beforeEach(function () {
    stores = { orderRequests: [], orderItems: [], returns: [], allocations: [], balances: [], stockMovements: [], history: [] }; events = []; movements = [];
    global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, ignored, code) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'order' ? { orderLifecycle: orderProperties.orderLifecycle } : key === 'fulfillment' ? fulfillmentProperties : key === 'inventory' ? inventoryProperties : {} };
    global.SERVICE = {
      DefaultOrderLifecycleOrchestrationService: orderOrchestration,
      DefaultOrderReturnOutcomeService: orderReturnOutcome,
      DefaultOrderLifecycleAuditService: orderAudit,
      DefaultOrderLifecycleEventService: orderEvents,
      DefaultOrderLifecycleRequestPolicyService: {}, DefaultDatabaseTransactionService: { execute: async (options, action) => action({}) },
      DefaultOrderLifecycleRequestService: repository(stores.orderRequests, 'requestCode'), DefaultOrderLifecycleRequestItemService: repository(stores.orderItems, 'requestItemCode'),
      DefaultOrderHistoryEntryService: repository(stores.history, 'historyCode'),
      DefaultExactUnitsService: exactUnits,
      DefaultReturnRequestService: returnRequest, DefaultFulfillmentPolicyService: fulfillmentPolicy,
      DefaultFulfillmentReturnRequestService: repository(stores.returns, 'returnCode'), DefaultFulfillmentReturnEventService: fulfillmentEvents,
      DefaultEventService: { handleEvent: async request => { events.push(request.event); if (request.event.event === 'fulfillmentReturn.return_closed') await orderReturnOutcome.handleClosed({ tenant: request.tenant, authData: { tokenType: 'service', entCode: request.event.data.enterpriseCode, principalId: 'event-consumer' }, event: request.event }); } },
      DefaultReturnDispositionMovementService: inventoryDisposition,
      DefaultInventoryEnterpriseScopeService: { resolveEnterpriseCode: request => request.authData.entCode || request.enterpriseCode },
      DefaultStockAllocationService: { get: async request => ({ result: stores.allocations.filter(row => matches(row, request.query)) }) },
      DefaultStockBalanceService: { get: async request => ({ result: stores.balances.filter(row => matches(row, request.query)) }) },
      DefaultStockMovementRecordService: { get: async request => ({ result: stores.stockMovements.filter(row => matches(row, request.query)) }) },
      DefaultStockMovementService: { stockCode: (enterpriseCode, stock) => `${enterpriseCode}:${stock.warehouseCode}:${stock.itemCode}:${stock.conditionCode}`, apply: async request => { const movement = { code: `movement-${movements.length + 1}`, idempotencyKey: request.movement.idempotencyKey, enterpriseCode: request.authData.entCode, state: 'COMPLETED', quantity: request.movement.quantity, movementType: request.movement.movementType }; movements.push(movement); stores.stockMovements.push(movement); return movement; } },
      DefaultPipelineService: { start: async (name, request) => { assert.strictEqual(name, 'returnReceiptDispositionPipeline'); return runCallbackPipeline(fulfillmentGraph, request, receiptDisposition); } },
    };
  });
  afterEach(function () { global.CONFIG = originals.CONFIG; global.SERVICE = originals.SERVICE; global.CLASSES = originals.CLASSES; });

  const seed = () => {
    stores.orderRequests.push({ requestCode: 'return-request-1', entCode: 'enterprise1', orderCode: 'order1', requestType: 'RETURN', requesterCode: 'customer1', reasonCode: 'CUSTOMER_RETURN', state: 'AUTHORIZED', version: 1, evidence: { authorizationDecision: 'PARTIALLY_AUTHORIZED' } });
    stores.orderItems.push({ requestItemCode: 'return-item-serialized', requestCode: 'return-request-1', orderEntryCode: 'entry-serialized', requestedQuantity: '1', approvedQuantity: '1', serialNumbers: ['SERIAL-1'], immutableEvidence: { allocationReferences: ['allocation-serialized'] } }, { requestItemCode: 'return-item-bulk', requestCode: 'return-request-1', orderEntryCode: 'entry-bulk', requestedQuantity: '2', approvedQuantity: '1', rejectedQuantity: '1', immutableEvidence: { allocationReferences: ['allocation-bulk'] } });
    stores.allocations.push({ enterpriseCode: 'enterprise1', allocationCode: 'allocation-serialized', unitCode: 'EA', assignments: [{ reservationCode: 'reservation-serialized', stockCode: 'stock-serialized', quantity: '1' }] }, { enterpriseCode: 'enterprise1', allocationCode: 'allocation-bulk', unitCode: 'EA', assignments: [{ reservationCode: 'reservation-bulk', stockCode: 'stock-bulk', quantity: '1' }] });
    stores.balances.push({ enterpriseCode: 'enterprise1', code: 'stock-serialized', warehouseCode: 'warehouse1', itemCode: 'sku-serialized', conditionCode: 'RETURNED', unitCode: 'EA', revision: 0 }, { enterpriseCode: 'enterprise1', code: 'stock-bulk', warehouseCode: 'warehouse1', itemCode: 'sku-bulk', conditionCode: 'RETURNED', unitCode: 'EA', revision: 0 });
    return { tenant: 'tenant1', authData: { tokenType: 'service', entCode: 'enterprise1', principalId: 'workflow' }, workflowCarrier: { code: 'return-carrier-1', sourceDetail: { processType: 'orderLifecycleRequest', requestType: 'RETURN', requestCode: 'return-request-1', entCode: 'enterprise1', orderCode: 'order1', requestVersion: 1 } } };
  };
  const access = (returnCode, body) => ({ tenant: 'tenant1', authData: { tokenType: 'access', principalId: 'warehouse-user', enterpriseCode: 'enterprise1' }, params: { returnCode }, body });

  it('creates serialized and bulk RMAs, receives partially, inspects, dispositions Inventory, closes, emits history facts, and replays idempotently', async function () {
    const source = seed();
    const created = await orderReturnWorkflow.createRma(source);
    assert.strictEqual(created.feedback.returns.length, 2);
    assert.deepStrictEqual(stores.returns.find(row => row.itemCodes[0] === 'entry-serialized').serializedItems, [{ itemCode: 'entry-serialized', serialNumber: 'SERIAL-1' }]);
    const rma = stores.returns.find(row => row.itemCodes[0] === 'entry-bulk');
    const serializedRma = stores.returns.find(row => row.itemCodes[0] === 'entry-serialized');
    await returnRequest.approveReturn({ tenant: 'tenant1', authData: { tokenType: 'service' }, returnCode: rma.returnCode, dispositionCode: 'RESTOCK', refundPolicyCode: 'ORIGINAL_RAIL' });
    await returnRequest.approveReturn({ tenant: 'tenant1', authData: { tokenType: 'service' }, returnCode: serializedRma.returnCode, dispositionCode: 'RESTOCK', refundPolicyCode: 'ORIGINAL_RAIL' });
    const received = await warehouse.receive(access(rma.returnCode, { receivedQuantity: '0.5' }));
    assert.strictEqual(received.receivedQuantity, '0.5');
    await warehouse.inspect(access(rma.returnCode, { inspectionResult: 'SELLABLE', dispositionCode: 'RESTOCK' }));
    assert.ok(stores.returns.find(row => row.returnCode === rma.returnCode).inventoryDispositionIntent, JSON.stringify(stores.returns.find(row => row.returnCode === rma.returnCode)));
    const disposed = await warehouse.disposition(access(rma.returnCode, { receivedQuantity: '0.5', inspectionResult: 'SELLABLE', dispositionCode: 'RESTOCK' }));
    assert.strictEqual(disposed.returnRequest.status, 'CLOSED');
    assert.strictEqual(disposed.inventoryDisposition.status, 'INVENTORY_DISPOSITION_APPLIED');
    assert.strictEqual(stores.orderRequests[0].state, 'PARTIALLY_COMPLETED');
    await warehouse.receive(access(serializedRma.returnCode, { receivedQuantity: '1' }));
    await warehouse.inspect(access(serializedRma.returnCode, { inspectionResult: 'SELLABLE', dispositionCode: 'RESTOCK' }));
    await warehouse.disposition(access(serializedRma.returnCode, { receivedQuantity: '1', inspectionResult: 'SELLABLE', dispositionCode: 'RESTOCK' }));
    assert.strictEqual(movements.length, 2);
    assert.strictEqual(stores.orderRequests[0].state, 'COMPLETED');
    assert.strictEqual(stores.orderRequests[0].evidence.refundEligibility.eligible, true);
    const replay = await warehouse.disposition(access(rma.returnCode, { receivedQuantity: '0.5', inspectionResult: 'SELLABLE', dispositionCode: 'RESTOCK' }));
    assert.strictEqual(replay.returnRequest.idempotent, true);
    assert.strictEqual(movements.length, 2);
    assert.ok(events.some(event => event.data.status === 'RECEIVED'));
    assert.ok(events.some(event => event.data.status === 'CLOSED'));
    assert.ok(events.some(event => event.event === 'orderLifecycle.return_completed' && event.data.notificationIntent));
    assert.ok(stores.history.some(row => row.eventType === 'RETURN_COMPLETED'));
    assert.strictEqual(stores.returns.find(row => row.returnCode === rma.returnCode).inventoryDispositionEvidence.movements[0].code, 'movement-1');
  });

  it('rejects stale concurrent warehouse mutation and unsupported disposition without corrupting persisted evidence', async function () {
    seed(); await orderReturnWorkflow.createRma({ tenant: 'tenant1', authData: { tokenType: 'service', entCode: 'enterprise1' }, workflowCarrier: { code: 'return-carrier-1', sourceDetail: { processType: 'orderLifecycleRequest', requestType: 'RETURN', requestCode: 'return-request-1', entCode: 'enterprise1', orderCode: 'order1', requestVersion: 1 } } });
    const rma = stores.returns[0]; await returnRequest.approveReturn({ tenant: 'tenant1', authData: { tokenType: 'service' }, returnCode: rma.returnCode });
    const stale = Object.assign({}, stores.returns[0]); await returnRequest.receiveReturn({ tenant: 'tenant1', authData: { tokenType: 'service' }, returnCode: rma.returnCode, receivedQuantity: '1' });
    await assert.rejects(() => returnRequest.transitionReturn({ tenant: 'tenant1', authData: { tokenType: 'service' }, returnRequest: stale }, 'RECEIVED', { receivedQuantity: '1' }), /revision conflict/);
    await assert.rejects(() => returnRequest.inspectReturn({ tenant: 'tenant1', authData: { tokenType: 'service' }, returnCode: rma.returnCode, inspectionResult: 'UNKNOWN', dispositionCode: 'DESTROY_WITHOUT_POLICY' }), /unsupported/);
    assert.strictEqual(stores.returns[0].status, 'RECEIVED');
  });
});
