/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/test/orderLifecycleDiagnosticsContract @description Verifies bounded enterprise-scoped lifecycle diagnostics and owner recovery guidance. @layer test @owner order */
const assert = require('assert');
const properties = require('../config/properties');

global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
let captured;
global.SERVICE = {
    DefaultOrderLifecycleRequestService: {
        get: async request => {
            captured = request;
            return { result: [
                { requestCode: 'refund-1', requestType: 'REFUND', state: 'RECONCILIATION_REQUIRED', reasonCode: 'PROVIDER_FAILED', updatedAt: '2026-08-03T08:00:00.000Z' },
                { requestCode: 'return-1', requestType: 'RETURN', state: 'AUTHORIZATION_PENDING', reasonCode: 'DAMAGED', updatedAt: '2026-08-03T08:00:00.000Z' },
            ] };
        },
    },
    DefaultPaymentRefundDiagnosticsService: { scan: async () => ({ metrics: { refundAmount: '12.50', failureCount: 1, retryCount: 2, averageProviderLatencyMs: 125 }, correlations: { 'refund-1': 'payment-refund-1' }, findings: [{ findingCode: 'ORPHAN_PAYMENT_REFUND', owner: 'payment' }] }) },
    DefaultReturnStockDiagnosticsService: { scan: async () => ({ metrics: { stockDispositionCount: 1, stockDispositionByReason: { RESTOCK: 1 } }, correlations: { 'return-1': 'movement-1' }, findings: [{ findingCode: 'INCONSISTENT_RETURN_STOCK_MOVEMENT', owner: 'inventory' }] }) },
};

const diagnostics = require('../src/service/lifecycle/defaultOrderLifecycleDiagnosticsService');

(async () => {
    const result = await diagnostics.scan({ tenant: 'default', enterpriseCode: 'ent-1', authData: { tokenType: 'access' }, now: '2026-08-03T12:00:00.000Z' });
    assert.deepStrictEqual(captured.query, { entCode: 'ent-1' });
    assert.strictEqual(result.metrics.requestVolumeByType.REFUND, 1);
    assert.strictEqual(result.metrics.workloadByState.AUTHORIZATION_PENDING, 1);
    assert.strictEqual(result.metrics.reconciliationCount, 1);
    assert.strictEqual(result.metrics.owner.payment.refundAmount, '12.50');
    assert.strictEqual(result.metrics.owner.inventory.stockDispositionCount, 1);
    assert.strictEqual(result.correlations.payment['refund-1'], 'payment-refund-1');
    assert(result.findings.some(value => value.findingCode === 'INCONSISTENT_RETURN_STOCK_MOVEMENT'));
    assert(result.findings.some(value => value.owner === 'payment' && value.nextActions.includes('RECONCILE_PROVIDER_REFUND')));
    await assert.rejects(() => diagnostics.scan({ tenant: 'default', authData: { tokenType: 'access' } }), /enterprise scope/);
    await assert.rejects(() => diagnostics.scan({ tenant: 'default', enterpriseCode: 'ent-1', authData: {} }), /authenticated operations identity/);
    console.log('Order lifecycle diagnostics contract validated');
})().catch(error => { console.error(error); process.exit(1); });
