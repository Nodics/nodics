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
const paymentProperties = require('../../../payment/paymentCore/config/properties').payment;
const orderGraphs = require('../src/pipelines/pipelines');
const orchestration = require('../src/service/lifecycle/defaultOrderLifecycleOrchestrationService');
const workflow = require('../src/service/lifecycle/defaultOrderRefundWorkflowService');
const refundExecution = require('../src/service/lifecycle/defaultOrderRefundExecutionService');
const audit = require('../src/service/lifecycle/defaultOrderLifecycleAuditService');
const orderEvents = require('../src/service/lifecycle/defaultOrderLifecycleEventService');
const paymentCalculation = require('../../../payment/paymentCore/src/service/refund/defaultPaymentRefundCalculationService');
const paymentRefundExecution = require('../../../payment/paymentCore/src/service/refund/defaultPaymentRefundExecutionService');
const paymentReversal = require('../../../payment/paymentCore/src/service/cancellation/defaultPaymentCancellationExecutionService');
const paymentPolicy = require('../../../payment/paymentCore/src/service/policy/defaultPaymentPolicyService');
const providerGateway = require('../../../payment/paymentCore/src/service/provider/defaultPaymentProviderGatewayService');
const refundOutcome = require('../../../payment/paymentCore/src/service/refund/defaultPaymentRefundOutcomeService');
const paymentEvents = require('../../../payment/paymentCore/src/service/refund/defaultPaymentRefundEventService');

const matches = (row, query) => Object.entries(query || {}).every(([key, expected]) => expected && expected.$in ? expected.$in.includes(row[key]) : row[key] === expected);
const repository = (rows, identity) => ({
  get: async request => ({ result: rows.filter(row => matches(row, request.query)).slice(0, request.searchOptions && request.searchOptions.limit || rows.length) }),
  save: async request => { const current = rows.find(row => row[identity] === request.model[identity]); if (current) Object.assign(current, request.model); else rows.push(Object.assign({}, request.model)); return { result: [current || rows[rows.length - 1]] }; },
  update: async request => { const current = rows.find(row => matches(row, request.query)); if (!current) return { modifiedCount: 0 }; Object.assign(current, request.model); return { modifiedCount: 1 }; },
});
const runCallbackPipeline = async (graph, request, service) => {
  const response = {}; let nodeName = graph.startNode;
  while (nodeName) { const node = graph.nodes[nodeName], method = node.handler.split('.').pop(); const outcome = await new Promise((resolve, reject) => { const process = { nextSuccess: () => resolve({ branch: 'success' }), error: (a, b, error) => resolve({ branch: 'error', error }), resolve: result => resolve({ terminal: true, result }), reject }; Promise.resolve(service[method](request, response, process)).catch(reject); }); if (outcome.terminal) return outcome.result; if (outcome.branch === 'error') { response.error = outcome.error; nodeName = graph.handleError; } else nodeName = node.success; }
};

describe('Order and Payment persisted Refund runtime journey', function () {
  const originals = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  let stores; let providerCalls; let events; let failProvider;
  beforeEach(async function () {
    stores = { requests: [], items: [], transactions: [], history: [] }; providerCalls = []; events = []; failProvider = false;
    global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, ignored, code) { super(message); this.code = code; } } };
    global.CONFIG = { get: key => key === 'order' ? { orderLifecycle: orderProperties.orderLifecycle } : key === 'payment' ? paymentProperties : {} };
    const fakeProvider = { refund: async request => { providerCalls.push(request.transaction.idempotencyKey); if (failProvider && request.transaction.paymentGroupCode === 'group-wallet') { const error = new Error('provider timeout after acceptance'); error.code = 'PROVIDER_TIMEOUT_UNCERTAIN'; throw error; } return { status: 'REFUNDED', providerTransactionRef: `provider-${request.transaction.paymentGroupCode}`, completedAt: new Date() }; } };
    global.SERVICE = {
      DefaultOrderLifecycleOrchestrationService: orchestration, DefaultOrderLifecycleRequestPolicyService: {}, DefaultDatabaseTransactionService: { execute: async (options, action) => action({}) },
      DefaultOrderLifecycleRequestService: repository(stores.requests, 'requestCode'), DefaultOrderLifecycleRequestItemService: repository(stores.items, 'requestItemCode'), DefaultOrderHistoryEntryService: repository(stores.history, 'historyCode'),
      DefaultOrderLifecycleAuditService: audit, DefaultOrderLifecycleEventService: orderEvents,
      DefaultPaymentTransactionService: repository(stores.transactions, 'transactionCode'), DefaultPaymentPolicyService: paymentPolicy,
      DefaultPaymentRefundExecutionService: paymentRefundExecution, DefaultPaymentCancellationExecutionService: paymentReversal,
      DefaultPaymentProviderGatewayService: providerGateway, DefaultPaymentProviderPolicyService: { resolveForRequest: async request => ({ providerCode: request.transaction.providerCode, operation: 'REFUND', adapterService: 'QualifiedFakePaymentAdapter', gatewayRequired: true }) },
      QualifiedFakePaymentAdapter: fakeProvider,
      DefaultPaymentRefundOutcomeService: refundOutcome, DefaultPaymentRefundEventService: paymentEvents,
      DefaultOrderCancellationProductEvidenceProviderService: { resolve: async request => ({ items: request.items.map(item => ({ orderEntryCode: item.orderEntryCode, lifecycleType: 'PHYSICAL', providerActionRequired: false })) }) },
      DefaultProductLifecycleCancellationService: { execute: async request => ({ orderEntryCode: request.productLifecycleCancellation.orderEntryCode, status: 'CANCELLED' }) },
      DefaultEventService: { handleEvent: async request => events.push(request.event) },
      DefaultPipelineService: { start: async (name, request) => {
        if (name === 'refundCalculationPipeline') { const source = request.refundCalculation; const calculated = paymentCalculation.calculate({ entCode: source.request.entCode, orderCode: source.request.orderCode, idempotencyKey: `${source.request.idempotencyKey}:payment`, paymentAllocations: source.paymentAllocations, cancellationItems: source.items.map(item => ({ entryCode: item.orderEntryCode, requestedQuantity: item.requestedQuantity })), shippingRefundEvidence: request.shippingRefundEvidence }); return { amount: calculated.amount, currencyCode: calculated.currencyCode, paymentCalculation: calculated, taxEvidence: request.taxEvidence, discountEvidence: request.discountEvidence, shippingEvidence: request.shippingRefundEvidence }; }
        if (name === 'refundApprovalPreparationPipeline') return { route: 'MANUAL_REVIEW', riskEvidence: { band: 'MEDIUM', evidenceCode: 'risk-1' } };
        if (name === 'refundExecutionPipeline') return runCallbackPipeline(orderGraphs.refundExecutionPipeline, request, refundExecution);
        throw new Error(`Unexpected Pipeline ${name}`);
      } },
    };
    await providerGateway.init();
  });
  afterEach(function () { global.CONFIG = originals.CONFIG; global.SERVICE = originals.SERVICE; global.CLASSES = originals.CLASSES; });

  const seed = code => {
    stores.requests.push({ requestCode: code, entCode: 'enterprise1', orderCode: `order-${code}`, requestType: 'REFUND', requesterCode: 'maker1', requesterType: 'EMPLOYEE', reasonCode: 'CORRECTION', state: 'SUBMITTED', version: 1, idempotencyKey: `idempotency-${code}`, evidence: {} });
    stores.items.push({ requestItemCode: `${code}-item`, requestCode: code, orderEntryCode: 'entry1', requestedQuantity: '1', immutableEvidence: {} });
    stores.transactions.push({ enterpriseCode: 'enterprise1', transactionCode: `${code}-card-original`, idempotencyKey: `${code}-card-original`, providerCode: 'qualified-card-provider', paymentModeCode: 'CARD', paymentGroupCode: 'group-card', orderCode: `order-${code}`, operation: 'CAPTURE', amount: '70', currencyCode: 'AED', status: 'CAPTURED', revision: 0 }, { enterpriseCode: 'enterprise1', transactionCode: `${code}-wallet-original`, idempotencyKey: `${code}-wallet-original`, providerCode: 'qualified-wallet-provider', paymentModeCode: 'WALLET', paymentGroupCode: 'group-wallet', orderCode: `order-${code}`, operation: 'CAPTURE', amount: '30', currencyCode: 'AED', status: 'SETTLED', revision: 0 });
    const carrier = authData => ({ tenant: 'tenant1', authData, workflowCarrier: { code: `carrier-${code}`, sourceDetail: { processType: 'orderLifecycleRequest', requestType: 'REFUND', requestCode: code, entCode: 'enterprise1', orderCode: `order-${code}`, requestVersion: 1 } }, paymentAllocations: [{ allocationCode: 'allocation-card', entryCode: 'entry1', quantity: '0.7', paymentGroupCode: 'group-card', amount: '70', currencyCode: 'AED', originalTransactionCode: `${code}-card-original`, providerCode: 'qualified-card-provider', paymentModeCode: 'CARD' }, { allocationCode: 'allocation-wallet', entryCode: 'entry1', quantity: '0.3', paymentGroupCode: 'group-wallet', amount: '30', currencyCode: 'AED', originalTransactionCode: `${code}-wallet-original`, providerCode: 'qualified-wallet-provider', paymentModeCode: 'WALLET' }], taxEvidence: { taxRefundAmount: '5', evidenceCode: 'tax-1' }, discountEvidence: { discountImpact: '10', evidenceCode: 'promotion-1' }, shippingRefundEvidence: { shippingRefundAmount: '0', evidenceCode: 'shipping-1' } });
    return carrier;
  };

  it('calculates and executes exact multi-payment original-rail refund with maker-checker, audit, notification, and duplicate safety', async function () {
    const carrier = seed('refund-success');
    const evaluated = await workflow.evaluate(carrier({ tokenType: 'service', principalId: 'workflow' }));
    assert.strictEqual(evaluated.decision, 'MANUAL_REVIEW');
    await assert.rejects(() => workflow.approve(carrier({ tokenType: 'access', principalId: 'maker1' })), /requester cannot approve/);
    await workflow.approve(carrier({ tokenType: 'access', principalId: 'checker1' }));
    const executed = await workflow.execute(carrier({ tokenType: 'service', principalId: 'workflow' }));
    assert.strictEqual(executed.decision, 'SUCCESS');
    assert.strictEqual(stores.requests[0].state, 'COMPLETED');
    const refunds = stores.transactions.filter(row => row.operation === 'REFUND');
    assert.deepStrictEqual(refunds.map(row => row.amount).sort(), ['30', '70']);
    assert.deepStrictEqual(refunds.map(row => row.parentTransactionCode).sort(), ['refund-success-card-original', 'refund-success-wallet-original']);
    const replay = await workflow.execute(carrier({ tokenType: 'service', principalId: 'workflow' }));
    assert.strictEqual(replay.feedback.idempotent, true);
    assert.strictEqual(providerCalls.length, 2);
    assert.ok(stores.history.some(row => row.eventType === 'REFUND_EXECUTED'));
    assert.ok(events.some(event => event.event === 'orderLifecycle.refund_executed' && event.data.notificationIntent));
    assert.ok(stores.requests[0].evidence.calculation.taxEvidence);
    assert.ok(stores.requests[0].evidence.calculation.discountEvidence);
    const partial = paymentCalculation.calculate({ entCode: 'enterprise1', orderCode: 'order-refund-success', idempotencyKey: 'partial-refund', paymentAllocations: carrier({}).paymentAllocations, cancellationItems: [{ entryCode: 'entry1', requestedQuantity: '0.5' }] });
    assert.strictEqual(partial.amount, '50');
    assert.deepStrictEqual(partial.allocationEvidence.map(row => row.amount).sort(), ['15', '35']);
  });

  it('persists uncertain provider timeout, accepts one verified callback exactly once, and reconciles Order from Payment evidence', async function () {
    const carrier = seed('refund-timeout'); failProvider = true;
    await workflow.evaluate(carrier({ tokenType: 'service', principalId: 'workflow' }));
    await workflow.approve(carrier({ tokenType: 'access', principalId: 'checker1' }));
    await assert.rejects(() => workflow.execute(carrier({ tokenType: 'service', principalId: 'workflow' })), error => error.code === 'PROVIDER_TIMEOUT_UNCERTAIN');
    assert.strictEqual(stores.requests[0].state, 'RECONCILIATION_REQUIRED');
    const uncertain = stores.transactions.find(row => row.paymentGroupCode === 'group-wallet' && row.operation === 'REFUND');
    assert.strictEqual(uncertain.status, 'RECONCILIATION_REQUIRED');
    await assert.rejects(() => refundOutcome.handle({ tenant: 'tenant1', authData: { tokenType: 'service' }, body: { signatureVerified: false, providerEventCode: 'event1', transactionCode: uncertain.transactionCode, providerCode: uncertain.providerCode, status: 'REFUNDED' } }), /Verified normalized/);
    const outcome = { signatureVerified: true, providerEventCode: 'provider-refund-event-1', transactionCode: uncertain.transactionCode, providerCode: uncertain.providerCode, providerTransactionRef: 'provider-wallet-recovered', status: 'REFUNDED' };
    await refundOutcome.handle({ tenant: 'tenant1', authData: { tokenType: 'service' }, body: outcome });
    const replay = await refundOutcome.handle({ tenant: 'tenant1', authData: { tokenType: 'service' }, body: outcome });
    assert.strictEqual(replay.idempotent, true);
    const reconciled = await workflow.reconcile(carrier({ tokenType: 'service', principalId: 'workflow' }));
    assert.strictEqual(reconciled.decision, 'SUCCESS');
    assert.strictEqual(stores.requests[0].state, 'COMPLETED');
    assert.ok(!JSON.stringify(stores).includes('provider timeout after acceptance'));
  });
});
