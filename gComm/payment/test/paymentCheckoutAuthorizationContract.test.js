/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/test/paymentCheckoutAuthorizationContract
 * @description Protects checkout payment authorization as Payment-owned orchestration over order payment groups, provider boundaries, and transaction evidence.
 * @layer test
 * @owner payment
 * @override Project modules may replace gateway orchestration while preserving idempotent safe transaction evidence.
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
const deferredProviderAdapterService = require('../src/service/provider/defaultDeferredPaymentProviderAdapterService');
const authorizationService = require('../src/service/checkout/defaultPaymentCheckoutAuthorizationService');

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

global.SERVICE = {
    DefaultPaymentPolicyService: policyService,
    DefaultPaymentMethodPolicyService: methodPolicyService,
    DefaultPaymentProviderRegistryService: providerRegistryService,
    DefaultPaymentProviderPolicyService: providerPolicyService,
    DefaultPaymentProviderGatewayService: gatewayService,
    DefaultManualPaymentProviderAdapterService: manualProviderAdapterService,
    DefaultCardPaymentProviderAdapterService: cardProviderAdapterService,
    DefaultDeferredPaymentProviderAdapterService: deferredProviderAdapterService,
    DefaultPaymentTransactionService: {
        get: async (request) => ({ result: savedTransactions.filter((item) => item.idempotencyKey === request.query.idempotencyKey) }),
        save: async (request) => {
            savedTransactions.push(clone(request.model));
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
    idempotencyKey: 'checkout-1',
    allocationCopy: {
        paymentGroups: [
            { entCode: 'enterpriseA', orderCode: 'order::checkout-1', paymentGroupCode: 'card-main', paymentModeCode: 'CARD', plannedAmount: '20.00', currencyCode: 'USD' },
            { entCode: 'enterpriseA', orderCode: 'order::checkout-1', paymentGroupCode: 'cod-balance', paymentModeCode: 'COD', plannedAmount: '10.00', currencyCode: 'USD' },
        ],
    },
};

(async () => {
    const result = await authorizationService.authorize(clone(request));
    assert.strictEqual(result.orderCode, 'order::checkout-1');
    assert.strictEqual(result.count, 2);
    assert.strictEqual(result.authorized.length, 1);
    assert.strictEqual(result.deferred.length, 1);
    assert.strictEqual(result.failed.length, 0);
    assert.strictEqual(result.authorized[0].status, 'AUTHORIZED');
    assert.strictEqual(result.authorized[0].providerCode, 'defaultCardProvider');
    assert.strictEqual(result.deferred[0].status, 'DEFERRED');
    assert.strictEqual(result.deferred[0].providerCode, 'deferredPaymentProvider');
    assert.strictEqual(savedTransactions.length, 2);
    assert.strictEqual(savedTransactions[0].rawGatewayPayload, undefined);

    const replay = await authorizationService.authorize(clone(request));
    assert.strictEqual(replay.authorized[0].idempotent, true);
    assert.strictEqual(replay.deferred[0].idempotent, true);
    assert.strictEqual(savedTransactions.length, 2);

    const invalid = clone(request);
    invalid.idempotencyKey = 'checkout-2';
    invalid.allocationCopy.paymentGroups[0].plannedAmount = 0.1 + 0.2;
    await assert.rejects(
        () => authorizationService.authorize(invalid),
        (error) => error.code === 'ERR_PAY_00003' && error.message.includes('failed')
    );

    console.log('Payment checkout authorization contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
