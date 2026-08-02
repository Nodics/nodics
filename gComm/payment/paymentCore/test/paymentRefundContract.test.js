/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/test/paymentRefundContract
 * @description Protects Payment-owned refund transaction evidence for return and order-adjustment flows.
 * @layer test
 * @owner payment
 * @override Project modules may replace PSP refund integration while preserving idempotent safe transaction evidence.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultPaymentPolicyService');
const gatewayService = require('../src/service/provider/defaultPaymentProviderGatewayService');
const methodPolicyService = require('../src/service/provider/defaultPaymentMethodPolicyService');
const providerRegistryService = require('../src/service/provider/defaultPaymentProviderRegistryService');
const providerPolicyService = require('../src/service/provider/defaultPaymentProviderPolicyService');
const manualProviderAdapterService = require('../src/service/provider/defaultManualPaymentProviderAdapterService');
const cardProviderAdapterService = require('../src/service/provider/defaultCardPaymentProviderAdapterService');
const refundService = require('../src/service/refund/defaultPaymentRefundService');

global.CONFIG = {
    get: (key) => key === 'payment' ? properties.payment : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(message, cause, code) {
            super(String(message));
            this.cause = cause;
            this.code = code;
        }
    },
};

const clone = (value) => JSON.parse(JSON.stringify(value));
let savedTransactions = [];
let providerCalls = 0;

global.SERVICE = {
    DefaultPaymentPolicyService: policyService,
    DefaultPaymentMethodPolicyService: methodPolicyService,
    DefaultPaymentProviderRegistryService: providerRegistryService,
    DefaultPaymentProviderPolicyService: providerPolicyService,
    DefaultManualPaymentProviderAdapterService: manualProviderAdapterService,
    DefaultCardPaymentProviderAdapterService: cardProviderAdapterService,
    DefaultPaymentProviderGatewayService: Object.assign({}, gatewayService, {
        refund: async (gatewayRequest) => {
            providerCalls += 1;
            return gatewayService.refund(gatewayRequest);
        },
    }),
    DefaultPaymentTransactionService: {
        get: async (request) => ({
            result: savedTransactions.filter((item) =>
                Object.entries(request.query || {}).every(([key, value]) => item[key] === value)
            ),
        }),
        save: async (request) => {
            const existingIndex = savedTransactions.findIndex((item) => item.idempotencyKey === request.model.idempotencyKey);
            if (existingIndex >= 0) {
                savedTransactions[existingIndex] = clone(request.model);
            } else {
                savedTransactions.push(clone(request.model));
            }
            return { result: [request.model] };
        },
    },
};

const request = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    entCode: 'enterpriseA',
    cartCode: 'cart-1',
    orderCode: 'order::checkout-1',
    paymentGroupCode: 'card-main',
    paymentModeCode: 'CARD',
    amount: '12.50',
    currencyCode: 'USD',
    returnCode: 'return::checkout-1',
};

(async () => {
    const refunded = await refundService.refund(clone(request));
    assert.strictEqual(refunded.operation, 'REFUND');
    assert.strictEqual(refunded.status, 'REFUNDED');
    assert.strictEqual(refunded.amount, '12.50');
    assert.strictEqual(refunded.providerCode, 'defaultCardProvider');
    assert.strictEqual(refunded.providerTransactionRef, 'refunded::' + refunded.transactionCode);
    assert.strictEqual(refunded.rawGatewayPayload, undefined);
    assert.strictEqual(savedTransactions.length, 1);
    assert.strictEqual(providerCalls, 1);

    const replay = await refundService.refund(clone(request));
    assert.strictEqual(replay.idempotent, true);
    assert.strictEqual(savedTransactions.length, 1);
    assert.strictEqual(providerCalls, 1);

    const terminalRetry = await refundService.retryRefund(clone(request));
    assert.strictEqual(terminalRetry.idempotent, true);
    assert.strictEqual(terminalRetry.recovered, true);
    assert.strictEqual(terminalRetry.recoveryAction, 'NO_RETRY_REQUIRED');
    assert.strictEqual(providerCalls, 1);

    const failedRefundRequest = Object.assign(clone(request), {
        returnCode: 'return::checkout-failed',
        idempotencyKey: 'failed-refund',
    });
    const failedDraft = policyService.buildRefundDraft(failedRefundRequest);
    savedTransactions.push(Object.assign({}, failedDraft, {
        status: 'FAILED',
        failureCode: 'PROVIDER_TIMEOUT',
        failureMessage: 'Safe provider timeout',
    }));
    const recovered = await refundService.retryRefund(failedRefundRequest);
    assert.strictEqual(recovered.recovered, true);
    assert.strictEqual(recovered.recoveryAction, 'RETRY_REFUND');
    assert.strictEqual(recovered.recoveryStatus, 'RECOVERED');
    assert.strictEqual(recovered.status, 'REFUNDED');
    assert.strictEqual(recovered.retryCount, 1);
    assert.strictEqual(savedTransactions.filter((item) => item.idempotencyKey === failedDraft.idempotencyKey).length, 1);

    const reconciled = await refundService.reconcileRefund(failedRefundRequest);
    assert.strictEqual(reconciled.recoveryAction, 'RECONCILE_PROVIDER_REFUND');
    assert.strictEqual(reconciled.recovered, true);
    assert.strictEqual(reconciled.status, 'REFUNDED');

    const invalidAmount = Object.assign(clone(request), {
        returnCode: 'return::checkout-2',
        amount: 0.1 + 0.2,
    });
    await assert.rejects(
        () => refundService.refund(invalidAmount),
        (error) => error.code === 'ERR_PAY_00001' && error.message.includes('exact non-negative decimal string')
    );

    const unsafe = Object.assign(clone(request), {
        returnCode: 'return::checkout-3',
        rawGatewayPayload: { token: 'never-store' },
    });
    await assert.rejects(
        () => refundService.refund(unsafe),
        (error) => error.code === 'ERR_PAY_00001' && error.message.includes('raw provider payloads')
    );

    console.log('Payment refund contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
