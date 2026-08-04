/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module payment/test/paymentRefundOperationsSecurityContract @description Ensures finance operations preserve trusted request scope. @layer test @owner payment */
const assert = require('assert');

let received;
global.SERVICE = {
    DefaultPaymentRefundService: {
        retryRefund: async request => { received = request; return { status: 'RETRY_SCHEDULED' }; },
        reconcileRefund: async request => { received = request; return { status: 'RECONCILED' }; },
    },
};

const facade = require('../src/facade/refund/defaultPaymentRefundOperationsFacade');

(async () => {
    const trustedAuth = { tokenType: 'access', principalId: 'finance-1' };
    const request = {
        tenant: 'trusted-tenant',
        authData: trustedAuth,
        body: { tenant: 'attacker-tenant', authData: { tokenType: 'service' }, refundCode: 'refund-1' },
    };
    await facade.retry(request);
    assert.strictEqual(received.tenant, 'trusted-tenant');
    assert.strictEqual(received.authData, trustedAuth);
    assert.strictEqual(received.refundCode, 'refund-1');
    await facade.reconcile(request);
    assert.strictEqual(received.tenant, 'trusted-tenant');
    assert.strictEqual(received.authData, trustedAuth);
    await facade.retry({ tenant: 'trusted-tenant', authData: trustedAuth, body: { actionId: 'retry-refund', model: { enterpriseCode: 'ent-1', transactionCode: 'refund-tx-1', orderCode: 'order-1', refundCode: 'refund-1' } } }); assert.strictEqual(received.entCode, 'ent-1'); assert.strictEqual(received.refundTransactionCode, 'refund-tx-1'); assert.strictEqual(received.tenant, 'trusted-tenant');
    console.log('Payment Refund operations security contract validated');
})().catch(error => { console.error(error); process.exit(1); });
