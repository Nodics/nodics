/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
const properties = require('../config/properties').order;
const graphs = require('../src/pipelines/pipelines');
const orchestration = require('../src/service/lifecycle/defaultOrderLifecycleOrchestrationService');
const workflow = require('../src/service/lifecycle/defaultOrderCancellationWorkflowService');
const execution = require('../src/service/lifecycle/defaultOrderCancellationExecutionService');
const audit = require('../src/service/lifecycle/defaultOrderLifecycleAuditService');
const lifecycleEvents = require('../src/service/lifecycle/defaultOrderLifecycleEventService');

const valueAt = (row, key) => row[key];
const matches = (row, query) => Object.entries(query || {}).every(([key, expected]) => {
  const actual = valueAt(row, key);
  if (expected && expected.$in) return expected.$in.includes(actual);
  return actual === expected;
});
const repository = rows => ({
  get: async request => ({ result: rows.filter(row => matches(row, request.query)).slice(0, request.searchOptions && request.searchOptions.limit || rows.length) }),
  save: async request => { rows.push(Object.assign({}, request.model)); return { result: [rows[rows.length - 1]] }; },
  update: async request => { const row = rows.find(item => matches(item, request.query)); if (!row) return { modifiedCount: 0 }; Object.assign(row, request.model); return { modifiedCount: 1 }; },
});

const runCallbackPipeline = async (graph, request, service) => {
  const response = {};
  let nodeName = graph.startNode;
  while (nodeName) {
    const node = graph.nodes[nodeName];
    const method = node.handler.split('.').pop();
    const outcome = await new Promise((resolve, reject) => {
      const process = {
        nextSuccess: () => resolve({ branch: 'success' }),
        error: (ignoredRequest, ignoredResponse, error) => resolve({ branch: 'error', error }),
        resolve: result => resolve({ terminal: true, result }),
        reject,
      };
      Promise.resolve(service[method](request, response, process)).catch(reject);
    });
    if (outcome.terminal) return outcome.result;
    if (outcome.branch === 'error') {
      response.error = outcome.error;
      nodeName = graph.handleError;
    } else nodeName = node.success;
  }
};

describe('Order persisted cancellation runtime journey', function () {
  const originalConfig = global.CONFIG;
  const originalService = global.SERVICE;
  const originalClasses = global.CLASSES;
  let stores;
  let ownerCalls;

  beforeEach(function () {
    stores = { requests: [], items: [], entries: [], orders: [], history: [] };
    ownerCalls = { fulfillment: [], inventory: [], payment: [], product: [], notifications: [] };
    global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, ignored, code) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'order' ? { orderLifecycle: properties.orderLifecycle } : {} };
    global.SERVICE = {
      DefaultOrderLifecycleOrchestrationService: orchestration,
      DefaultOrderCancellationExecutionService: execution,
      DefaultOrderLifecycleAuditService: audit,
      DefaultOrderLifecycleRequestPolicyService: {},
      DefaultDatabaseTransactionService: { execute: async (options, action) => action({ transactionCode: 'memory' }) },
      DefaultOrderLifecycleRequestService: repository(stores.requests),
      DefaultOrderLifecycleRequestItemService: repository(stores.items),
      DefaultOrderEntryService: repository(stores.entries),
      DefaultOrderService: repository(stores.orders),
      DefaultOrderHistoryEntryService: repository(stores.history),
      DefaultFulfillmentCancellationIntentService: { cancel: async request => { ownerCalls.fulfillment.push(request.body); return { status: 'CANCELLED', operationCode: request.body.cancellationCode }; } },
      DefaultStockAllocationCancellationOrchestrationService: { cancel: async request => { ownerCalls.inventory.push(request.body); return { status: 'RELEASED', movementCode: request.body.cancellationCode }; } },
      DefaultPaymentCancellationExecutionService: { execute: async request => { ownerCalls.payment.push(request.body); return { status: request.body.allocations[0].paymentState === 'AUTHORIZED' ? 'VOIDED' : 'REFUNDED', transactionCode: 'payment-reversal-1' }; } },
      DefaultProductLifecycleCancellationService: { execute: async request => { ownerCalls.product.push(request.productLifecycleCancellation); return { status: 'CANCELLED', reference: request.productLifecycleCancellation.orderEntryCode }; } },
      DefaultOrderLifecycleEventService: lifecycleEvents,
      DefaultEventService: { handleEvent: async request => ownerCalls.notifications.push(request.event) },
      DefaultPipelineService: { start: async (name, request) => {
        assert.strictEqual(name, 'orderCancellationExecutionPipeline');
        return runCallbackPipeline(graphs.orderCancellationExecutionPipeline, request, execution);
      } },
    };
  });
  afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; global.CLASSES = originalClasses; });

  const seed = ({ code, ordered = '2', cancel = '2', paymentState = 'AUTHORIZED' }) => {
    const request = { active: true, entCode: 'enterprise1', requestCode: code, requestType: 'CANCELLATION', orderCode: `order-${code}`, idempotencyKey: `idem-${code}`, requesterCode: 'customer1', requesterType: 'CUSTOMER', reasonCode: 'CUSTOMER_REQUEST', state: 'APPROVED', version: 1, evidence: { requestVersion: 1, approvalDecision: 'APPROVED', approvalRoute: 'MANUAL_REVIEW', eligibility: { eligible: true, items: [{ orderEntryCode: `entry-${code}`, evidence: { lifecycleType: 'PHYSICAL', fulfillmentRequired: true, inventoryCancellationAllocations: [{ allocationCode: `allocation-${code}`, quantity: cancel, serialNumbers: [] }] } }] }, calculation: { amount: '20.00', paymentCalculation: { allocationEvidence: [{ paymentGroupCode: `payment-${code}`, originalTransactionCode: `transaction-${code}`, providerCode: 'qualified-provider', paymentModeCode: 'card', paymentState, amount: '20.00', currencyCode: 'AED' }] } } } };
    stores.requests.push(request);
    stores.items.push({ requestItemCode: `item-${code}`, requestCode: code, orderEntryCode: `entry-${code}`, requestedQuantity: cancel, unitCode: 'EA', immutableEvidence: { allocationCode: `allocation-${code}` } });
    stores.entries.push({ entCode: 'enterprise1', orderCode: request.orderCode, entryCode: `entry-${code}`, quantity: ordered, cancelledQuantity: '0', status: 'ACTIVE', lifecycleRevision: 0 });
    stores.orders.push({ entCode: 'enterprise1', code: request.orderCode, status: 'PROCESSING', lifecycleRevision: 0 });
    return { tenant: 'tenant1', authData: { tokenType: 'service', enterpriseCode: 'enterprise1', principalId: 'workflow' }, workflowCarrier: { code: `carrier-${code}`, sourceDetail: { processType: 'orderLifecycleRequest', requestType: 'CANCELLATION', requestCode: code, entCode: 'enterprise1', orderCode: request.orderCode, requestVersion: 1 } } };
  };

  it('executes full pre-settlement cancellation through configured owner nodes, history, audit, event, and exact duplicate replay', async function () {
    const request = seed({ code: 'cancel-full', paymentState: 'AUTHORIZED' });
    const result = await workflow.execute(request);
    const duplicate = await workflow.execute(request);
    assert.strictEqual(result.feedback.state, 'COMPLETED');
    assert.strictEqual(duplicate.feedback.idempotent, true);
    assert.strictEqual(stores.orders[0].status, 'CANCELLED');
    assert.strictEqual(stores.entries[0].cancelledQuantity, '2');
    assert.strictEqual(ownerCalls.fulfillment.length, 1);
    assert.strictEqual(ownerCalls.inventory.length, 1);
    assert.strictEqual(ownerCalls.payment.length, 1);
    assert.ok(stores.history.some(row => row.eventType === 'CANCELLATION_COMPLETED'));
    assert.ok(stores.history.some(row => row.eventType === 'CANCELLATION_EXECUTION_CHECKPOINT'));
    assert.ok(ownerCalls.notifications.length > 0);
  });

  it('persists partial post-settlement cancellation and moves owner failure to reconciliation for safe retry', async function () {
    const partial = seed({ code: 'cancel-partial', ordered: '3', cancel: '1', paymentState: 'SETTLED' });
    await workflow.execute(partial);
    assert.strictEqual(stores.orders[0].status, 'PARTIALLY_CANCELLED');
    assert.strictEqual(stores.entries[0].cancelledQuantity, '1');
    const failure = seed({ code: 'cancel-failure', paymentState: 'CAPTURED' });
    global.SERVICE.DefaultPaymentCancellationExecutionService.execute = async () => { const error = new Error('provider timeout'); error.code = 'PAYMENT_TIMEOUT_UNCERTAIN'; throw error; };
    await assert.rejects(() => workflow.execute(failure), error => error.code === 'PAYMENT_TIMEOUT_UNCERTAIN');
    assert.strictEqual(stores.requests.find(row => row.requestCode === 'cancel-failure').state, 'RECONCILIATION_REQUIRED');
    assert.strictEqual(stores.requests.find(row => row.requestCode === 'cancel-failure').evidence.execution.failureCode, 'PAYMENT_TIMEOUT_UNCERTAIN');
    assert.ok(!JSON.stringify(stores.requests).includes('provider timeout'));
  });
});
