/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderCancellationCalculationContract
 * @description Protects side-effect-free partial cancellation amount calculation through Payment-owned exact allocation policy.
 * @layer test
 * @owner order
 * @override Projects may replace evidence sources or pipeline nodes while preserving immutable pricing references and Payment calculation authority.
 */
const assert = require('assert');

const orderProperties = require('../config/properties');
const paymentProperties = require('../../../payment/paymentCore/config/properties');
global.CONFIG = {
    get: (key) => key === 'order' ? orderProperties.order : key === 'payment' ? paymentProperties.payment : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) { super(String(message)); this.cause = cause; this.code = code; }
    },
};

const paymentPolicy = require('../../../payment/paymentCore/src/service/policy/defaultPaymentPolicyService');
const paymentCalculation = require('../../../payment/paymentCore/src/service/refund/defaultPaymentRefundCalculationService');
const calculation = require('../src/service/lifecycle/defaultOrderCancellationCalculationService');
const pipelines = require('../src/pipelines/pipelines');
const config = orderProperties.order.orderLifecycle.cancellationCalculation;

global.SERVICE = {
    DefaultPaymentPolicyService: paymentPolicy,
    DefaultPaymentRefundCalculationService: paymentCalculation,
    DefaultTaxRefundEvidenceService: { calculate: async request => ({ authority: 'tax', currencyCode: request.taxRefundEvidence.currencyCode, taxRefundAmount: '0.32', items: request.taxRefundEvidence.items }) },
    DefaultPromotionRefundImpactService: { calculate: async request => ({ authority: 'promotion', currencyCode: request.promotionRefundImpact.currencyCode, discountRefundImpact: '1.00', items: request.promotionRefundImpact.items }) },
    DefaultFulfillmentShippingRefundPolicyService: { calculate: async request => ({ authority: 'fulfillment', policyMode: 'NONE', currencyCode: request.shippingRefundEvidence.currencyCode, shippingRefundAmount: '0.00' }) },
};

assert.strictEqual(config.pipelineName, 'orderCancellationCalculationPipeline');
assert.strictEqual(config.paymentCalculationService, 'DefaultPaymentRefundCalculationService');
assert.strictEqual(pipelines.orderCancellationCalculationPipeline.hardStop, true);
assert.strictEqual(pipelines.orderCancellationCalculationPipeline.nodes.calculatePaymentAmount.handler, 'DefaultOrderCancellationCalculationService.calculatePaymentAmount');

const base = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    cancellationCalculation: {
        entCode: 'enterprise-1',
        orderCode: 'order-1',
        idempotencyKey: 'cancel-order-1-entry-1-v1',
        eligibility: {
            eligible: true,
            items: [{ orderEntryCode: 'entry-1', unitCode: 'EA', requestedQuantity: '1', eligibleQuantity: '2', eligible: true,
                evidence: { paymentTransactions: [
                    { transactionCode: 'card-auth-1', paymentGroupCode: 'card-main', providerCode: 'provider-card', paymentModeCode: 'CARD' },
                    { transactionCode: 'wallet-capture-1', paymentGroupCode: 'wallet-main', providerCode: 'provider-wallet', paymentModeCode: 'WALLET' }
                ] } }],
        },
        orderEntries: [{
            entryCode: 'entry-1', quantity: '3', currencyCode: 'USD', lineNetAmount: '12.00', lineGrossAmount: '12.96',
            taxTotal: '0.96', discountTotal: '3.00', taxIncluded: false, taxInclusionMode: 'TAX_EXCLUSIVE',
            priceEvidenceCode: 'price-1', taxQuoteCode: 'tax-quote-1', taxQuoteLineCode: 'tax-line-1',
        }],
        paymentAllocations: [
            { allocationCode: 'card-entry-1', entryCode: 'entry-1', paymentGroupCode: 'card-main', quantity: '2', amount: '10.00', currencyCode: 'USD' },
            { allocationCode: 'wallet-entry-1', entryCode: 'entry-1', paymentGroupCode: 'wallet-main', quantity: '1', amount: '5.00', currencyCode: 'USD' },
        ],
    },
};
const clone = (value) => JSON.parse(JSON.stringify(value));

(async () => {
    const result = await calculation.calculate(clone(base));
    assert.strictEqual(result.amount, '5');
    assert.strictEqual(result.currencyCode, 'USD');
    assert.strictEqual(result.strategy, 'PROPORTIONAL_ORIGINAL_PAYMENT_ALLOCATIONS');
    assert.strictEqual(result.pricingEvidence[0].taxQuoteLineCode, 'tax-line-1');
    assert.strictEqual(result.tax.authority, 'tax'); assert.strictEqual(result.tax.evidence.taxRefundAmount, '0.32');
    assert.strictEqual(result.discount.authority, 'promotion'); assert.strictEqual(result.discount.evidence.discountRefundImpact, '1.00');
    assert.strictEqual(result.shippingCharge.included, false);
    assert.strictEqual(result.paymentCalculation.allocationEvidence.length, 2);
    const calculatedByGroup = new Map(result.paymentCalculation.allocationEvidence.map(value => [value.paymentGroupCode, value]));
    assert.strictEqual(calculatedByGroup.get('card-main').originalTransactionCode, 'card-auth-1');
    assert.strictEqual(calculatedByGroup.get('wallet-main').providerCode, 'provider-wallet');

    const ineligible = clone(base);
    ineligible.cancellationCalculation.eligibility.eligible = false;
    await assert.rejects(calculation.calculate(ineligible), (error) => error.code === 'ERR_ORD_00049');

    const incomplete = clone(base);
    incomplete.cancellationCalculation.orderEntries = [];
    global.SERVICE.DefaultOrderEntryService = { get: async () => ({ result: [] }) };
    await assert.rejects(calculation.calculate(incomplete), /Order Entry evidence is incomplete/);

    const unsafe = clone(base);
    unsafe.cancellationCalculation.orderEntries[0].rawTaxPayload = { secret: 'never-store' };
    await assert.rejects(calculation.calculate(unsafe), /prohibited raw or secret evidence/);

    const direct = clone(base);
    const directEntries = direct.cancellationCalculation.orderEntries;
    const directAllocations = direct.cancellationCalculation.paymentAllocations;
    delete direct.cancellationCalculation.orderEntries;
    delete direct.cancellationCalculation.paymentAllocations;
    let sourceCalls = 0;
    global.SERVICE.DefaultOrderEntryService = { get: async () => { sourceCalls += 1; return { result: directEntries }; } };
    global.SERVICE.DefaultOrderPaymentAllocationService = { get: async () => { sourceCalls += 1; return { result: directAllocations }; } };
    const loaded = await calculation.calculate(direct);
    assert.strictEqual(loaded.amount, '5');
    assert.strictEqual(sourceCalls, 2);

    const savedPaymentService = global.SERVICE.DefaultPaymentRefundCalculationService;
    delete global.SERVICE.DefaultPaymentRefundCalculationService;
    await assert.rejects(calculation.calculate(clone(base)), (error) => error.code === 'ERR_ORD_00050');
    global.SERVICE.DefaultPaymentRefundCalculationService = savedPaymentService;

    console.log('Order cancellation calculation contract validated');
})().catch((error) => { console.error(error); process.exit(1); });
