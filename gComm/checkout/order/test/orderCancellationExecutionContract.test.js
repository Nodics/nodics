/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderCancellationExecutionContract
 * @description Protects Pipeline-based cancellation execution with owner delegation, durable Workflow checkpoints, and exact Order projection.
 * @layer test
 * @owner order
 * @override Projects may replace Pipeline nodes while preserving immutable approval, owner boundaries, checkpoints, and idempotent projection.
 */
const assert = require('assert');
const properties = require('../config/properties');
const execution = require('../src/service/lifecycle/defaultOrderCancellationExecutionService');
global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, cause, code) { super(String(message)); this.code = code; this.cause = cause; } } };
let lifecycleRequest; let entries; let order; let histories; let ownerCalls; let paymentOperation;
const match = (model, query) => Object.entries(query || {}).every(([key, value]) => model[key] === value);
const reset = () => {
  lifecycleRequest = { requestCode: 'cancel-1', requestType: 'CANCELLATION', entCode: 'enterprise-1', orderCode: 'order-1', state: 'APPROVED', version: 2, reasonCode: 'CUSTOMER_REQUEST', evidence: { requestVersion: 2, approvalDecision: 'APPROVED', eligibility: { eligible: true, items: [{ orderEntryCode: 'entry-1', evidence: { lifecycleType: 'PHYSICAL', inventoryRequired: true, fulfillmentRequired: true } }] }, calculation: { paymentCalculation: { allocationEvidence: [{ paymentGroupCode: 'card', originalTransactionCode: 'payment-auth-1', providerCode: 'providerA', paymentModeCode: 'CARD', amount: '5.00', currencyCode: 'USD' }] } } } };
  entries = [
    { entCode: 'enterprise-1', orderCode: 'order-1', entryCode: 'entry-1', quantity: '3', cancelledQuantity: '0', unitCode: 'EA', status: 'ALLOCATED', lifecycleRevision: 0 },
    { entCode: 'enterprise-1', orderCode: 'order-1', entryCode: 'entry-2', quantity: '1', cancelledQuantity: '0', unitCode: 'EA', status: 'ALLOCATED', lifecycleRevision: 0 },
  ];
  order = { entCode: 'enterprise-1', code: 'order-1', status: 'PROCESSING', lifecycleRevision: 0 };
  histories = []; ownerCalls = []; paymentOperation = 'VOID';
};
reset();
global.SERVICE = {
  DefaultOrderLifecycleAuditService: { record: async () => true },
  DefaultOrderLifecycleOrchestrationService: { updateState: async (request, current, expected, patch) => { assert(expected.includes(current.state)); lifecycleRequest = Object.assign({}, current, patch); return lifecycleRequest; } },
  DefaultFulfillmentCancellationIntentService: { cancel: async request => { ownerCalls.push(['fulfillment', request.body]); return { status: 'COMPLETED' }; } },
  DefaultProductLifecycleCancellationService: { execute: async request => { ownerCalls.push(['product', request.productLifecycleCancellation]); return { status: 'NO_PRODUCT_PROVIDER_ACTION_REQUIRED' }; } },
  DefaultStockAllocationCancellationOrchestrationService: { cancel: async request => { ownerCalls.push(['inventory', request.body]); return { state: 'COMPLETED' }; } },
  DefaultPaymentCancellationExecutionService: { execute: async request => { ownerCalls.push(['payment', request.body]); return { transactions: [{ operation: paymentOperation, status: paymentOperation === 'VOID' ? 'VOIDED' : 'REFUNDED' }] }; } },
  DefaultOrderEntryService: {
    get: async request => ({ result: entries.filter(value => match(value, request.query)) }),
    update: async request => { let index = entries.findIndex(value => match(value, request.query)); if (index < 0) return { result: { modifiedCount: 0 } }; entries[index] = Object.assign({}, entries[index], request.model); return { result: { modifiedCount: 1 } }; },
  },
  DefaultOrderService: {
    get: async request => ({ result: match(order, request.query) ? [order] : [] }),
    update: async request => { if (!match(order, request.query)) return { result: { modifiedCount: 0 } }; order = Object.assign({}, order, request.model); return { result: { modifiedCount: 1 } }; },
  },
  DefaultOrderHistoryEntryService: {
    get: async request => ({ result: histories.filter(value => match(value, request.query)) }),
    save: async request => { histories.push(request.model); return { result: [request.model] }; },
  },
};
const request = items => ({ tenant: 'tenant-1', authData: { tokenType: 'service', principalId: 'workflow' }, cancellationExecution: { request: lifecycleRequest, items: items || [{ orderEntryCode: 'entry-1', requestedQuantity: '1', unitCode: 'EA', serialNumbers: [], immutableEvidence: { allocationCode: 'allocation-1' } }] } });
const runNode = (name, req, response) => new Promise((resolve, reject) => execution[name](req, response, { nextSuccess: () => resolve(), error: (request, value, error) => reject(error) }));
const runExecution = async req => { let response = {}; for (let node of ['validateExecution', 'cancelFulfillment', 'cancelProductLifecycle', 'cancelInventory', 'reversePayment', 'finalizeOrder']) await runNode(node, req, response); return response; };

(async () => {
  let req = request(); let response = {};
  for (let node of ['validateExecution', 'cancelFulfillment', 'cancelProductLifecycle', 'cancelInventory', 'reversePayment', 'finalizeOrder']) await runNode(node, req, response);
  assert.deepStrictEqual(ownerCalls.map(value => value[0]), ['fulfillment', 'product', 'inventory', 'payment']);
  assert.strictEqual(ownerCalls[2][1].allocationCode, 'allocation-1');
  assert.strictEqual(ownerCalls[3][1].allocations[0].originalTransactionCode, 'payment-auth-1');
  assert.strictEqual(entries[0].cancelledQuantity, '1');
  assert.strictEqual(entries[0].status, 'ALLOCATED');
  assert.strictEqual(order.status, 'PARTIALLY_CANCELLED');
  assert.strictEqual(histories.length, 1);
  assert.strictEqual(lifecycleRequest.evidence.execution.currentStep, 'ORDER_FINALIZED');
  assert.strictEqual(response.cancellationExecutionResult.ownerEvidence.payment.transactions[0].status, 'VOIDED');
  let missingOriginal = request(); missingOriginal.cancellationExecution.request.evidence.calculation.paymentCalculation.allocationEvidence[0].originalTransactionCode = undefined;
  let failureResponse = {};
  await runNode('validateExecution', missingOriginal, failureResponse);
  await runNode('cancelFulfillment', missingOriginal, failureResponse);
  await runNode('cancelProductLifecycle', missingOriginal, failureResponse);
  await runNode('cancelInventory', missingOriginal, failureResponse);
  await assert.rejects(runNode('reversePayment', missingOriginal, failureResponse), error => error.code === 'ERR_ORD_00053');
  reset();
  lifecycleRequest.evidence.eligibility.items.push({ orderEntryCode: 'entry-2', evidence: { lifecycleType: 'PHYSICAL', inventoryRequired: true, fulfillmentRequired: true } });
  let fullItems = [{ orderEntryCode: 'entry-1', requestedQuantity: '3', unitCode: 'EA', serialNumbers: [], immutableEvidence: { allocationCode: 'allocation-1' } }, { orderEntryCode: 'entry-2', requestedQuantity: '1', unitCode: 'EA', serialNumbers: [], immutableEvidence: { allocationCode: 'allocation-2' } }];
  let fullVoid = await runExecution(request(fullItems));
  assert.strictEqual(fullVoid.cancellationExecutionResult.order.status, 'CANCELLED');
  assert.strictEqual(fullVoid.cancellationExecutionResult.ownerEvidence.payment.transactions[0].operation, 'VOID');
  assert(entries.every(value => value.status === 'CANCELLED'));
  reset();
  lifecycleRequest.evidence.eligibility.items.push({ orderEntryCode: 'entry-2', evidence: { lifecycleType: 'PHYSICAL', inventoryRequired: true, fulfillmentRequired: true } });
  paymentOperation = 'REFUND';
  lifecycleRequest.evidence.calculation.paymentCalculation.allocationEvidence[0].originalTransactionCode = 'payment-capture-1';
  let fullRefund = await runExecution(request(fullItems));
  assert.strictEqual(fullRefund.cancellationExecutionResult.order.status, 'CANCELLED');
  assert.strictEqual(fullRefund.cancellationExecutionResult.ownerEvidence.payment.transactions[0].operation, 'REFUND');
  assert.strictEqual(ownerCalls.find(value => value[0] === 'payment')[1].allocations[0].originalTransactionCode, 'payment-capture-1');
  const pipeline = require('../src/pipelines/pipelines').orderCancellationExecutionPipeline;
  assert.strictEqual(pipeline.nodes.cancelFulfillment.success, 'cancelProductLifecycle');
  assert.strictEqual(pipeline.nodes.cancelProductLifecycle.success, 'cancelInventory');
  assert.strictEqual(pipeline.nodes.cancelInventory.success, 'reversePayment');
  assert.strictEqual(pipeline.nodes.reversePayment.success, 'finalizeOrder');
  console.log('Order cancellation execution contract validated');
})().catch(error => { console.error(error); process.exit(1); });
