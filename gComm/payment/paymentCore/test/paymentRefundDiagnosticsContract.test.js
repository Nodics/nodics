/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available contract test. */
const assert = require('assert'); global.CONFIG = { get: key => key === 'units' ? { maximumScale: 18 } : undefined }; global.CLASSES = { NodicsError: class NodicsError extends Error {} }; global.SERVICE = { DefaultPaymentTransactionService: { get: async () => ({ result: [{ transactionCode: 'tx-1', refundCode: 'refund-1', operation: 'REFUND', amount: '12.50', status: 'RECOVERED', retryCount: 2, requestedAt: '2026-08-03T10:00:00.000Z', completedAt: '2026-08-03T10:00:00.125Z' }, { transactionCode: 'tx-2', operation: 'REFUND', amount: '5.00', status: 'FAILED', failureCode: 'TIMEOUT' }] }) }, DefaultExactUnitsService: require('../../../../gCore/units/src/service/exact/defaultExactUnitsService') }; const service = require('../src/service/refund/defaultPaymentRefundDiagnosticsService'); (async () => { let result = await service.scan({ tenant: 'default', authData: { tokenType: 'access' }, enterpriseCode: 'ent-1' }); assert.strictEqual(result.metrics.refundAmount, '17.50'); assert.strictEqual(result.metrics.failureCount, 1); assert.strictEqual(result.metrics.retryCount, 2); assert.strictEqual(result.metrics.averageProviderLatencyMs, 125); assert.strictEqual(result.correlations['refund-1'], 'tx-1'); assert(result.findings.some(value => value.findingCode === 'ORPHAN_PAYMENT_REFUND')); assert(result.findings.some(value => value.findingCode === 'FAILED_PROVIDER_REFUND')); console.log('Payment Refund diagnostics contract validated'); })().catch(error => { console.error(error); process.exit(1); });
