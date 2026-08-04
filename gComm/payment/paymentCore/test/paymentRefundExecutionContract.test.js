/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module payment/test/paymentRefundExecutionContract @description Protects approved Refund execution against original captured Payment rails. @layer test @owner payment */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: key => key === 'payment' ? properties.payment : undefined };
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(message, cause, code) { super(message); this.code = code; } } };
const policy = require('../src/service/policy/defaultPaymentPolicyService');
const reversal = require('../src/service/cancellation/defaultPaymentCancellationExecutionService');
const refund = require('../src/service/refund/defaultPaymentRefundExecutionService');
let records = [{ enterpriseCode: 'ent-1', transactionCode: 'capture-1', orderCode: 'order-1', paymentGroupCode: 'card-1', providerCode: 'stripe', paymentModeCode: 'CARD', currencyCode: 'USD', amount: '10.00', status: 'CAPTURED' }];
global.SERVICE = {
    DefaultPaymentPolicyService: policy,
    DefaultPaymentCancellationExecutionService: reversal,
    DefaultPaymentProviderGatewayService: { refund: async request => ({ status: 'REFUNDED', providerTransactionRef: 'provider-refund-1' }) },
    DefaultPaymentTransactionService: {
        get: async request => ({ result: records.filter(value => Object.entries(request.query).every(([key, item]) => value[key] === item)) }),
        save: async request => { records.push(request.model); return { result: [request.model] }; },
    },
};
const request = { tenant: 'default', authData: { tokenType: 'service' }, refundExecution: { enterpriseCode: 'ent-1', refundCode: 'refund-1', orderCode: 'order-1', requestVersion: 1, allocations: [{ paymentGroupCode: 'card-1', originalTransactionCode: 'capture-1', providerCode: 'stripe', paymentModeCode: 'CARD', amount: '4.00', currencyCode: 'USD' }] } };
(async () => {
    let result = await refund.execute(request); assert.strictEqual(result.transactions[0].operation, 'REFUND'); assert.strictEqual(result.transactions[0].refundCode, 'refund-1'); assert.strictEqual(result.transactions[0].parentTransactionCode, 'capture-1');
    let replay = await refund.execute(request); assert.strictEqual(replay.transactions[0].idempotent, true); assert.strictEqual(records.length, 2);
    let rerouted = JSON.parse(JSON.stringify(request)); rerouted.refundExecution.allocations[0].providerCode = 'paypal'; await assert.rejects(() => refund.execute(rerouted), /cannot reroute the original provider/);
    records[0].status = 'AUTHORIZED'; let unauthorized = JSON.parse(JSON.stringify(request)); unauthorized.refundExecution.refundCode = 'refund-2'; await assert.rejects(() => refund.execute(unauthorized), /requires captured or settled/);
    console.log('Payment Refund execution contract validated');
})().catch(error => { console.error(error); process.exit(1); });
