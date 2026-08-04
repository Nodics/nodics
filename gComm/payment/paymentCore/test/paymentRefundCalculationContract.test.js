/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/test/paymentRefundCalculationContract
 * @description Protects Payment-owned refund calculation from Order payment allocation evidence before provider refund execution.
 * @layer test
 * @owner payment
 * @override Project modules may customize refund calculation policy while preserving exact money, allocation evidence, and unsafe-payload rejection.
 */
const assert = require('assert');

const properties = require('../config/properties');
const policyService = require('../src/service/policy/defaultPaymentPolicyService');
const refundCalculationService = require('../src/service/refund/defaultPaymentRefundCalculationService');

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
global.SERVICE = {
    DefaultPaymentPolicyService: policyService,
};

const baseRequest = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    entCode: 'enterpriseA',
    orderCode: 'order::checkout-1',
    returnCode: 'return::checkout-1',
    idempotencyKey: 'reverse-1::refundCalculation',
    paymentAllocations: [
        {
            allocationCode: 'payment-allocation-1',
            sourceAllocationCode: 'cart-allocation-1',
            paymentGroupCode: 'card-main',
            amount: '12.50',
            currencyCode: 'USD',
        },
        {
            allocationCode: 'payment-allocation-2',
            sourceAllocationCode: 'cart-allocation-2',
            paymentGroupCode: 'card-main',
            amount: '2.50',
            currencyCode: 'USD',
        },
    ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const calculated = refundCalculationService.calculate(clone(baseRequest));
assert.strictEqual(calculated.strategy, 'SUM_PAYMENT_ALLOCATIONS');
assert.strictEqual(calculated.amount, '15');
assert.strictEqual(calculated.eligibleAmount, '15');
assert.strictEqual(calculated.currencyCode, 'USD');
assert.strictEqual(calculated.evidence.allocationCount, 2);
assert.deepStrictEqual(calculated.paymentGroupCodes, ['card-main']);

const partialCancellation = clone(baseRequest);
partialCancellation.paymentAllocations = [
    { allocationCode: 'card-entry-1', entryCode: 'entry-1', paymentGroupCode: 'card-main', quantity: '2', amount: '10.01', currencyCode: 'USD' },
    { allocationCode: 'wallet-entry-1', entryCode: 'entry-1', paymentGroupCode: 'wallet-main', quantity: '1', amount: '5.00', currencyCode: 'USD' },
];
partialCancellation.cancellationItems = [{ entryCode: 'entry-1', requestedQuantity: '1' }];
const partial = refundCalculationService.calculate(partialCancellation);
assert.strictEqual(partial.strategy, 'PROPORTIONAL_ORIGINAL_PAYMENT_ALLOCATIONS');
assert.strictEqual(partial.amount, '5');
assert.strictEqual(partial.eligibleAmount, '5');
assert.strictEqual(partial.evidence.cancellationQuantityScoped, true);
assert.strictEqual(partial.evidence.roundingMode, 'HALF_EVEN');
const withShipping = clone(partialCancellation); withShipping.shippingRefundEvidence = { shippingRefundAmount: '3.00', currencyCode: 'USD', paymentAllocationCode: 'card-entry-1', shippingAmountIncludedInAllocation: false, deliveryChargeEvidenceCode: 'delivery-1' }; const shipping = refundCalculationService.calculate(withShipping); assert.strictEqual(shipping.amount, '8'); assert.strictEqual(shipping.allocationEvidence.find(value => value.allocationCode === 'card-entry-1').shippingRefundAmount, '3.00');

const remainderDistribution = clone(baseRequest);
remainderDistribution.paymentAllocations = [
    { allocationCode: 'allocation-a', entryCode: 'entry-1', paymentGroupCode: 'card-main', quantity: '1', amount: '0.01', currencyCode: 'USD' },
    { allocationCode: 'allocation-b', entryCode: 'entry-1', paymentGroupCode: 'wallet-main', quantity: '1', amount: '0.02', currencyCode: 'USD' },
];
remainderDistribution.cancellationItems = [{ entryCode: 'entry-1', requestedQuantity: '1' }];
const distributed = refundCalculationService.calculate(remainderDistribution);
assert.strictEqual(distributed.amount, '0.02');

const excessiveQuantity = clone(partialCancellation);
excessiveQuantity.cancellationItems[0].requestedQuantity = '4';
assert.throws(
    () => refundCalculationService.calculate(excessiveQuantity),
    (error) => error.code === 'ERR_PAY_00005' && error.message.includes('exceeds payment allocation quantity')
);

const scoped = refundCalculationService.calculate(Object.assign(clone(baseRequest), {
    allocationCodes: ['cart-allocation-1'],
}));
assert.strictEqual(scoped.amount, '12.5');
assert.strictEqual(scoped.eligibleAmount, '12.5');
assert.deepStrictEqual(scoped.sourceAllocationCodes, ['cart-allocation-1']);

const explicit = refundCalculationService.calculate(Object.assign(clone(baseRequest), {
    refundAmount: '10.00',
}));
assert.strictEqual(explicit.amount, '10');
assert.strictEqual(explicit.eligibleAmount, '15');
assert.strictEqual(explicit.evidence.explicitAmountApplied, true);

assert.throws(
    () => refundCalculationService.calculate(Object.assign(clone(baseRequest), {
        refundAmount: '20.00',
    })),
    (error) => error.code === 'ERR_PAY_00005' && error.message.includes('exceeds eligible')
);

const mixedCurrency = clone(baseRequest);
mixedCurrency.paymentAllocations[1].currencyCode = 'EUR';
assert.throws(
    () => refundCalculationService.calculate(mixedCurrency),
    (error) => error.code === 'ERR_PAY_00005' && error.message.includes('one currency')
);

assert.throws(
    () => refundCalculationService.calculate(Object.assign(clone(baseRequest), {
        rawGatewayPayload: { token: 'never-store' },
    })),
    (error) => error.code === 'ERR_PAY_00005' && error.message.includes('raw provider payloads')
);

console.log('Payment refund calculation contract validated');
