/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const checkoutAllocationPolicy = require('../../../../cart/src/utils/checkoutAllocationPolicy');

/**
 * @module order/service/allocation/DefaultOrderCheckoutAllocationPolicyService
 * @description Validates order checkout delivery/payment groups and immutable quantity-level allocation evidence copied from cart checkout state.
 * @layer service
 * @owner order
 * @override Project modules may override order.checkoutAllocation.policy or replace this service to enforce customer-specific order allocation lifecycle rules.
 */
module.exports = {
    /** Initializes Order checkout allocation policy validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Order checkout allocation policy validation startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Order checkout allocation policy. */
    policy: function () { return (((CONFIG.get('order') || {}).checkoutAllocation || {}).policy) || {}; },
    /** Creates a stable Order checkout allocation policy error. */
    error: function (message) { return new CLASSES.NodicsError(message, null, 'ERR_ORD_00002'); },
    /** Validates an Order Delivery Group payload. */
    prepareDeliveryGroup: function (request) {
        const result = checkoutAllocationPolicy.validateDeliveryGroup((request || {}).model, this.policy(), { parentField: 'orderCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Validates an Order Payment Group payload. */
    preparePaymentGroup: function (request) {
        const result = checkoutAllocationPolicy.validatePaymentGroup((request || {}).model, this.policy(), { parentField: 'orderCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Validates an Order Delivery Allocation payload. */
    prepareDeliveryAllocation: function (request) {
        const result = checkoutAllocationPolicy.validateAllocation((request || {}).model, this.policy(), {
            parentField: 'orderCode',
            groupField: 'deliveryGroupCode',
        });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Validates an Order Payment Allocation payload. */
    preparePaymentAllocation: function (request) {
        const result = checkoutAllocationPolicy.validateAllocation((request || {}).model, this.policy(), {
            parentField: 'orderCode',
            groupField: 'paymentGroupCode',
            amountRequired: true,
        });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Builds one Order Delivery Group from one Cart Delivery Group while retaining source cart evidence. */
    buildDeliveryGroupFromCartDeliveryGroup: function (cartDeliveryGroup, orderContext) {
        const model = checkoutAllocationPolicy.buildOrderDeliveryGroupFromCartDeliveryGroup(cartDeliveryGroup, orderContext, this.policy());
        const result = checkoutAllocationPolicy.validateDeliveryGroup(model, this.policy(), { parentField: 'orderCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        return result.model;
    },
    /** Builds one Order Payment Group from one Cart Payment Group while retaining source cart evidence. */
    buildPaymentGroupFromCartPaymentGroup: function (cartPaymentGroup, orderContext) {
        const model = checkoutAllocationPolicy.buildOrderPaymentGroupFromCartPaymentGroup(cartPaymentGroup, orderContext, this.policy());
        const result = checkoutAllocationPolicy.validatePaymentGroup(model, this.policy(), { parentField: 'orderCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        return result.model;
    },
    /** Builds one Order Delivery Allocation from one Cart Delivery Allocation with configured group/code remapping. */
    buildDeliveryAllocationFromCartDeliveryAllocation: function (cartDeliveryAllocation, orderContext) {
        const model = checkoutAllocationPolicy.buildOrderDeliveryAllocationFromCartDeliveryAllocation(cartDeliveryAllocation, orderContext, this.policy());
        const result = checkoutAllocationPolicy.validateAllocation(model, this.policy(), {
            parentField: 'orderCode',
            groupField: 'deliveryGroupCode',
        });
        if (!result.valid) throw this.error(result.errors.join('; '));
        return result.model;
    },
    /** Builds one Order Payment Allocation from one Cart Payment Allocation with configured group/code remapping. */
    buildPaymentAllocationFromCartPaymentAllocation: function (cartPaymentAllocation, orderContext) {
        const model = checkoutAllocationPolicy.buildOrderPaymentAllocationFromCartPaymentAllocation(cartPaymentAllocation, orderContext, this.policy());
        const result = checkoutAllocationPolicy.validateAllocation(model, this.policy(), {
            parentField: 'orderCode',
            groupField: 'paymentGroupCode',
            amountRequired: true,
        });
        if (!result.valid) throw this.error(result.errors.join('; '));
        return result.model;
    },
    /** Backward-compatible low-level builder for custom conversion services. Prefer named builders above. */
    buildFromCartAllocation: function (cartAllocation, orderContext, options) {
        return checkoutAllocationPolicy.buildOrderModelFromCartModel(cartAllocation, orderContext, options);
    },
    /** Rejects destructive Order checkout allocation deletion; callers must cancel through lifecycle state. */
    rejectHardDelete: function () {
        return Promise.reject(this.error('Order checkout allocation history cannot be hard-deleted; cancel it'));
    },
};
