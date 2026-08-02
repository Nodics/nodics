/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module payment/test/paymentFoundationContract
 * @description Protects Payment as the owner of provider metadata, transaction evidence, exact money policy, and safe payment lifecycle boundaries.
 * @layer test
 * @owner payment
 * @override Project modules may customize providers and payment policy without moving gateway logic into Cart or Order.
 */
const assert = require('assert');

const properties = require('../config/properties');
const schemas = require('../src/schemas/schemas');
const interceptors = require('../src/interceptors/interceptors');
const policyService = require('../src/service/policy/defaultPaymentPolicyService');

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

assert.strictEqual(properties.payment.paymentPolicy.operations.includes('AUTHORIZE'), true);
assert.strictEqual(properties.payment.paymentPolicy.deferredPaymentModes.includes('COD'), true);
assert.strictEqual(properties.payment.paymentPolicy.refundCalculation.defaultStrategy, 'SUM_PAYMENT_ALLOCATIONS');
assert.strictEqual(properties.payment.paymentPolicy.refundCalculation.explicitAmountMustNotExceedEligible, true);
assert.strictEqual(properties.backofficeCapabilities.payment.navigation[0].workbenchTarget.schemaName, 'paymentTransaction');

assert.strictEqual(schemas.payment.paymentProvider.router.enabled, false);
assert.strictEqual(schemas.payment.paymentTransaction.router.enabled, false);
assert.strictEqual(schemas.payment.paymentProvider.service.enabled, true);
assert.strictEqual(schemas.payment.paymentTransaction.service.enabled, true);
assert.strictEqual(schemas.payment.paymentTransaction.definition.amount.type, 'string');
assert.strictEqual(schemas.payment.paymentTransaction.definition.providerTransactionRef.required, false);
assert.strictEqual(schemas.payment.paymentTransaction.definition.rawGatewayPayload, undefined);
assert.strictEqual(schemas.payment.paymentTransaction.definition.cardNumber, undefined);
assert.strictEqual(schemas.payment.paymentProvider.definition.secret, undefined);

assert.strictEqual(interceptors.paymentProviderPreSavePolicy.handler, 'DefaultPaymentPolicyService.prepareProvider');
assert.strictEqual(interceptors.paymentTransactionPreSavePolicy.handler, 'DefaultPaymentPolicyService.prepareTransaction');
assert.strictEqual(interceptors.paymentTransactionPreRemovePolicy.handler, 'DefaultPaymentPolicyService.rejectHardDelete');

assert.strictEqual(policyService.validateMoney('100'), true);
assert.strictEqual(policyService.validateMoney('100.25'), true);
assert.strictEqual(policyService.validateMoney(100.25), false);
assert.strictEqual(policyService.validateMoney('01.25'), false);
assert.strictEqual(policyService.providerCode('CARD'), 'defaultCardProvider');
assert.strictEqual(policyService.operation('COD'), 'DEFER');
assert.strictEqual(policyService.successStatus('DEFER'), 'DEFERRED');
assert.strictEqual(policyService.successStatus('REFUND'), 'REFUNDED');

const provider = policyService.prepareProvider({
    model: {
        enterpriseCode: 'enterpriseA',
        providerCode: 'defaultCardProvider',
        providerType: 'CARD_GATEWAY',
        displayName: 'Default Card Provider',
        paymentModes: ['CARD'],
        operations: ['AUTHORIZE'],
    },
});
assert.strictEqual(provider.status, 'ACTIVE');

assert.throws(
    () => policyService.prepareProvider({
        model: {
            enterpriseCode: 'enterpriseA',
            providerCode: 'badProvider',
            providerType: 'CARD_GATEWAY',
            displayName: 'Bad',
            paymentModes: ['CARD'],
            operations: ['AUTHORIZE'],
            secret: 'never-store-this',
        },
    }),
    (error) => error.code === 'ERR_PAY_00001' && error.message.includes('must not store raw credentials')
);

assert.throws(
    () => policyService.prepareTransaction({
        model: {
            enterpriseCode: 'enterpriseA',
            transactionCode: 'tx-1',
            idempotencyKey: 'idem-1',
            providerCode: 'defaultCardProvider',
            paymentModeCode: 'CARD',
            paymentGroupCode: 'card-main',
            operation: 'AUTHORIZE',
            amount: 0.1 + 0.2,
            currencyCode: 'USD',
        },
    }),
    (error) => error.code === 'ERR_PAY_00001' && error.message.includes('exact non-negative decimal string')
);

assert.throws(
    () => policyService.prepareTransaction({
        model: {
            enterpriseCode: 'enterpriseA',
            transactionCode: 'tx-2',
            idempotencyKey: 'idem-2',
            providerCode: 'defaultCardProvider',
            paymentModeCode: 'CARD',
            paymentGroupCode: 'card-main',
            operation: 'REFUND',
            amount: '1.00',
            currencyCode: 'USD',
            rawGatewayPayload: { token: 'never-store' },
        },
    }),
    (error) => error.code === 'ERR_PAY_00001' && error.message.includes('raw provider payloads')
);

console.log('Payment foundation contract validated');
