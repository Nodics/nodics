/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const checkoutAllocationPolicy = require('../../utils/checkoutAllocationPolicy');

/**
 * @module cart/service/allocation/DefaultCartCheckoutAllocationPolicyService
 * @description Validates cart checkout delivery/payment groups and quantity-level allocations without owning fulfillment, payment gateway, pricing, or inventory calculation rules.
 * @layer service
 * @owner cart
 * @override Project modules may override cart.checkoutAllocation.policy or replace this service to enforce customer-specific split delivery/payment validation.
 */
module.exports = {
    /** Initializes Cart checkout allocation policy validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Cart checkout allocation policy validation startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Cart checkout allocation policy. */
    policy: function () { return (((CONFIG.get('cart') || {}).checkoutAllocation || {}).policy) || {}; },
    /** Creates a stable Cart checkout allocation policy error. */
    error: function (message) { return new CLASSES.NodicsError(message, null, 'ERR_ORD_00002'); },
    /** Validates a Cart Delivery Group payload. */
    prepareDeliveryGroup: function (request) {
        const result = checkoutAllocationPolicy.validateDeliveryGroup((request || {}).model, this.policy(), { parentField: 'cartCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Validates a Cart Payment Group payload. */
    preparePaymentGroup: function (request) {
        const result = checkoutAllocationPolicy.validatePaymentGroup((request || {}).model, this.policy(), { parentField: 'cartCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Validates a Cart Delivery Allocation payload. */
    prepareDeliveryAllocation: function (request) {
        const result = checkoutAllocationPolicy.validateAllocation((request || {}).model, this.policy(), {
            parentField: 'cartCode',
            groupField: 'deliveryGroupCode',
        });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Validates a Cart Payment Allocation payload. */
    preparePaymentAllocation: function (request) {
        const result = checkoutAllocationPolicy.validateAllocation((request || {}).model, this.policy(), {
            parentField: 'cartCode',
            groupField: 'paymentGroupCode',
            amountRequired: true,
        });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Rejects destructive Cart checkout allocation deletion; callers must cancel through lifecycle state. */
    rejectHardDelete: function () {
        return Promise.reject(this.error('Cart checkout allocation history cannot be hard-deleted; cancel it'));
    },
};
