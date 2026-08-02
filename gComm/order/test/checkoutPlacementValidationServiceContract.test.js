/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/test/checkoutPlacementValidationServiceContract
 * @description Protects checkout placement validation as a Workflow action service that validates distributed delivery and payment allocation before inventory reservation.
 * @layer test
 * @owner order
 * @override Project modules may extend checkout validation through layered policy or service replacement while preserving exact quantity allocation checks.
 */
const assert = require('assert');

const orderProperties = require('../config/properties');
const cartProperties = require('../../cart/config/properties');
const validationService = require('../src/service/placement/defaultOrderCheckoutPlacementValidationService');

global.CONFIG = {
    get: (key) => {
        if (key === 'order') return orderProperties.order;
        if (key === 'cart') return cartProperties.cart;
        return undefined;
    },
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
global.SERVICE = {};

const baseRequest = {
    tenant: 'default',
    authData: { tokenType: 'service', principalId: 'workflow' },
    cartCode: 'cart-1',
    entCode: 'default',
    cart: { code: 'cart-1', entCode: 'default', active: true, status: 'READY_FOR_CHECKOUT' },
    cartEntries: [
        { cartCode: 'cart-1', entCode: 'default', entryCode: 'entry-1', quantity: '3', unitCode: 'piece' },
        { cartCode: 'cart-1', entCode: 'default', entryCode: 'entry-2', quantity: '1', unitCode: 'piece' },
    ],
    cartDeliveryGroups: [
        { cartCode: 'cart-1', entCode: 'default', deliveryGroupCode: 'delivery-home', groupType: 'ADDRESS', status: 'ACTIVE' },
        { cartCode: 'cart-1', entCode: 'default', deliveryGroupCode: 'delivery-office', groupType: 'ADDRESS', status: 'ACTIVE' },
    ],
    cartPaymentGroups: [
        { cartCode: 'cart-1', entCode: 'default', paymentGroupCode: 'payment-card', paymentModeCode: 'card', currencyCode: 'USD', status: 'ACTIVE' },
        { cartCode: 'cart-1', entCode: 'default', paymentGroupCode: 'payment-cod', paymentModeCode: 'cod', currencyCode: 'USD', status: 'ACTIVE' },
    ],
    cartDeliveryAllocations: [
        { cartCode: 'cart-1', entCode: 'default', allocationCode: 'delivery-entry-1-home', entryCode: 'entry-1', deliveryGroupCode: 'delivery-home', quantity: '2', unitCode: 'piece', serialNumbers: ['S1', 'S2'], status: 'ACTIVE' },
        { cartCode: 'cart-1', entCode: 'default', allocationCode: 'delivery-entry-1-office', entryCode: 'entry-1', deliveryGroupCode: 'delivery-office', quantity: '1', unitCode: 'piece', serialNumbers: ['S3'], status: 'ACTIVE' },
        { cartCode: 'cart-1', entCode: 'default', allocationCode: 'delivery-entry-2-home', entryCode: 'entry-2', deliveryGroupCode: 'delivery-home', quantity: '1', unitCode: 'piece', status: 'ACTIVE' },
    ],
    cartPaymentAllocations: [
        { cartCode: 'cart-1', entCode: 'default', allocationCode: 'payment-entry-1-card', entryCode: 'entry-1', paymentGroupCode: 'payment-card', quantity: '2', unitCode: 'piece', amount: '20.00', currencyCode: 'USD', serialNumbers: ['S1', 'S2'], status: 'ACTIVE' },
        { cartCode: 'cart-1', entCode: 'default', allocationCode: 'payment-entry-1-cod', entryCode: 'entry-1', paymentGroupCode: 'payment-cod', quantity: '1', unitCode: 'piece', amount: '10.00', currencyCode: 'USD', serialNumbers: ['S3'], status: 'ACTIVE' },
        { cartCode: 'cart-1', entCode: 'default', allocationCode: 'payment-entry-2-card', entryCode: 'entry-2', paymentGroupCode: 'payment-card', quantity: '1', unitCode: 'piece', amount: '5.00', currencyCode: 'USD', status: 'ACTIVE' },
    ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

(async () => {
    assert.deepStrictEqual(orderProperties.order.checkoutPlacement.validation.allowedCartStatuses, ['ACTIVE', 'READY_FOR_CHECKOUT', 'CHECKOUT_READY']);

    const valid = await validationService.validate(clone(baseRequest));
    assert.strictEqual(valid.valid, true);
    assert.strictEqual(valid.counts.entries, 2);
    assert.strictEqual(valid.counts.deliveryAllocations, 3);
    assert.strictEqual(valid.counts.paymentAllocations, 3);

    const overAllocated = clone(baseRequest);
    overAllocated.cartDeliveryAllocations[0].quantity = '4';
    await assert.rejects(
        () => validationService.validate(overAllocated),
        (error) => error.code === 'ERR_ORD_00022' && error.message.includes('allocation quantity exceeds entry quantity')
    );

    const missingPaymentGroup = clone(baseRequest);
    missingPaymentGroup.cartPaymentAllocations[0].paymentGroupCode = 'missing-payment-group';
    await assert.rejects(
        () => validationService.validate(missingPaymentGroup),
        (error) => error.code === 'ERR_ORD_00022' && error.message.includes('references missing payment group')
    );

    const wrongEnterprise = clone(baseRequest);
    wrongEnterprise.cart.entCode = 'other';
    await assert.rejects(
        () => validationService.validate(wrongEnterprise),
        (error) => error.code === 'ERR_ORD_00022' && error.message.includes('cart enterprise does not match placement request')
    );

    console.log('Checkout placement validation service contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
