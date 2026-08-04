/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const checkoutAllocationPolicy = require('../../../../cart/src/utils/checkoutAllocationPolicy');

/**
 * @module order/service/placement/DefaultOrderCheckoutPlacementValidationService
 * @description Validates a cart checkout aggregate before the checkout placement Workflow advances to inventory reservation.
 * @layer service
 * @owner order
 * @override Project modules may replace this service to add customer-specific checkout readiness, enterprise scope, payment, delivery, serial-number, or approval rules without bypassing Workflow.
 */
module.exports = {
    /** Initializes checkout placement validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout placement validation startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered checkout placement validation policy. */
    policy: function () { return (((CONFIG.get('order') || {}).checkoutPlacement || {}).validation) || {}; },
    /** Returns layered checkout allocation policy reused for exact quantity checks. */
    allocationPolicy: function () { return (((CONFIG.get('cart') || {}).checkoutAllocation || {}).policy) || {}; },
    /** Creates a stable checkout placement validation error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_ORD_00022');
        let error = new Error(message);
        error.code = 'ERR_ORD_00022';
        return error;
    },
    /** Normalizes generated-service responses and preloaded arrays. */
    items: function (value) {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.items)) return value.items;
        return [value];
    },
    /** Loads records by cartCode from a generated schema service when orchestration did not preload them. */
    loadByCart: async function (serviceName, request, property) {
        if (request[property]) return this.items(request[property]);
        let service = SERVICE[serviceName];
        if (!service || typeof service.get !== 'function') return [];
        let response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { cartCode: request.cartCode },
            searchOptions: { limit: Number((this.policy().maximumAggregateRecords || 1000)) },
        });
        return this.items(response);
    },
    /** Loads the cart header from the generated Cart service or preloaded aggregate. */
    loadCart: async function (request) {
        if (request.cartAggregate) return this.items(request.cartAggregate)[0];
        if (request.cart) return this.items(request.cart)[0];
        if (!SERVICE.DefaultCartService || typeof SERVICE.DefaultCartService.get !== 'function') return undefined;
        let response = await SERVICE.DefaultCartService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { code: request.cartCode },
            searchOptions: { limit: 2 },
        });
        let carts = this.items(response);
        if (carts.length > 1) throw this.error('Checkout placement cart lookup resolved multiple records');
        return carts[0];
    },
    /** Builds the validation aggregate from preloaded data or generated schema services. */
    aggregate: async function (request) {
        let cart = await this.loadCart(request);
        let entries = request.cartEntries ? this.items(request.cartEntries) : await this.loadByCart('DefaultCartEntryService', request, 'cartEntries');
        let deliveryGroups = request.cartDeliveryGroups ? this.items(request.cartDeliveryGroups) : await this.loadByCart('DefaultCartDeliveryGroupService', request, 'cartDeliveryGroups');
        let paymentGroups = request.cartPaymentGroups ? this.items(request.cartPaymentGroups) : await this.loadByCart('DefaultCartPaymentGroupService', request, 'cartPaymentGroups');
        let deliveryAllocations = request.cartDeliveryAllocations ? this.items(request.cartDeliveryAllocations) : await this.loadByCart('DefaultCartDeliveryAllocationService', request, 'cartDeliveryAllocations');
        let paymentAllocations = request.cartPaymentAllocations ? this.items(request.cartPaymentAllocations) : await this.loadByCart('DefaultCartPaymentAllocationService', request, 'cartPaymentAllocations');
        return {
            cart: cart,
            entries: entries,
            deliveryGroups: deliveryGroups,
            paymentGroups: paymentGroups,
            deliveryAllocations: deliveryAllocations,
            paymentAllocations: paymentAllocations,
        };
    },
    /** Validates cart header readiness and enterprise scope. */
    validateCart: function (aggregate, request, errors) {
        let policy = this.policy();
        let cart = aggregate.cart || {};
        if (!cart.code) errors.push('cart header is unavailable');
        if (cart.code && cart.code !== request.cartCode) errors.push('cart code does not match placement request');
        if (cart.entCode && cart.entCode !== request.entCode) errors.push('cart enterprise does not match placement request');
        if (cart.active === false) errors.push('cart is inactive');
        if (cart.status && (policy.allowedCartStatuses || ['ACTIVE', 'READY_FOR_CHECKOUT', 'CHECKOUT_READY']).indexOf(cart.status) === -1) {
            errors.push('cart status is not checkout-ready');
        }
    },
    /** Validates every group and allocation model through the shared checkout allocation policy. */
    validateModels: function (aggregate, errors) {
        let allocationPolicy = this.allocationPolicy();
        aggregate.deliveryGroups.forEach((group) => {
            let result = checkoutAllocationPolicy.validateDeliveryGroup(group, allocationPolicy, { parentField: 'cartCode' });
            if (!result.valid) errors.push('delivery group ' + (group && group.deliveryGroupCode || '<unknown>') + ': ' + result.errors.join('; '));
        });
        aggregate.paymentGroups.forEach((group) => {
            let result = checkoutAllocationPolicy.validatePaymentGroup(group, allocationPolicy, { parentField: 'cartCode' });
            if (!result.valid) errors.push('payment group ' + (group && group.paymentGroupCode || '<unknown>') + ': ' + result.errors.join('; '));
        });
        aggregate.deliveryAllocations.forEach((allocation) => {
            let result = checkoutAllocationPolicy.validateAllocation(allocation, allocationPolicy, { parentField: 'cartCode', groupField: 'deliveryGroupCode' });
            if (!result.valid) errors.push('delivery allocation ' + (allocation && allocation.allocationCode || '<unknown>') + ': ' + result.errors.join('; '));
        });
        aggregate.paymentAllocations.forEach((allocation) => {
            let result = checkoutAllocationPolicy.validateAllocation(allocation, allocationPolicy, { parentField: 'cartCode', groupField: 'paymentGroupCode', amountRequired: true });
            if (!result.valid) errors.push('payment allocation ' + (allocation && allocation.allocationCode || '<unknown>') + ': ' + result.errors.join('; '));
        });
    },
    /** Validates relation references, quantity totals, and serial-number coverage. */
    validateRelations: function (aggregate, errors) {
        let entryCodes = new Set(aggregate.entries.map((entry) => entry && entry.entryCode).filter(Boolean));
        let deliveryGroupCodes = new Set(aggregate.deliveryGroups.map((group) => group && group.deliveryGroupCode).filter(Boolean));
        let paymentGroupCodes = new Set(aggregate.paymentGroups.map((group) => group && group.paymentGroupCode).filter(Boolean));

        aggregate.deliveryAllocations.forEach((allocation) => {
            if (allocation && allocation.entryCode && !entryCodes.has(allocation.entryCode)) errors.push('delivery allocation ' + allocation.allocationCode + ' references missing cart entry');
            if (allocation && allocation.deliveryGroupCode && !deliveryGroupCodes.has(allocation.deliveryGroupCode)) errors.push('delivery allocation ' + allocation.allocationCode + ' references missing delivery group');
        });
        aggregate.paymentAllocations.forEach((allocation) => {
            if (allocation && allocation.entryCode && !entryCodes.has(allocation.entryCode)) errors.push('payment allocation ' + allocation.allocationCode + ' references missing cart entry');
            if (allocation && allocation.paymentGroupCode && !paymentGroupCodes.has(allocation.paymentGroupCode)) errors.push('payment allocation ' + allocation.allocationCode + ' references missing payment group');
        });

        let deliveryTotals = checkoutAllocationPolicy.validateAllocationTotals(aggregate.entries, aggregate.deliveryAllocations, this.allocationPolicy());
        if (!deliveryTotals.valid) errors.push.apply(errors, deliveryTotals.errors.map((error) => 'delivery ' + error));
        let paymentTotals = checkoutAllocationPolicy.validateAllocationTotals(aggregate.entries, aggregate.paymentAllocations, this.allocationPolicy());
        if (!paymentTotals.valid) errors.push.apply(errors, paymentTotals.errors.map((error) => 'payment ' + error));
    },
    /** Validates the checkout aggregate and returns safe evidence for the Workflow action feedback. */
    validate: async function (request) {
        if (!request || !request.tenant || !request.authData || !request.cartCode || !request.entCode) {
            throw this.error('Checkout placement validation requires tenant, auth, cartCode, and entCode');
        }
        let aggregate = await this.aggregate(request);
        let errors = [];
        if (!aggregate.entries.length) errors.push('cart has no checkout entries');
        this.validateCart(aggregate, request, errors);
        this.validateModels(aggregate, errors);
        this.validateRelations(aggregate, errors);
        if (errors.length) throw this.error(errors.join('; '));
        const cart = aggregate.cart || {};
        if (SERVICE.DefaultKycDecisionEnforcementService) request.kycDecision = await SERVICE.DefaultKycDecisionEnforcementService.enforce(request, 'CHECKOUT', { enterpriseCode: request.entCode, subjectType: 'CUSTOMER', subjectCode: request.customerCode || cart.customerCode || cart.ownerId, orderMinorUnits: cart.totalPriceMinorUnits || cart.totalMinorUnits, currency: cart.currencyCode });
        return {
            valid: true,
            cartCode: request.cartCode,
            entCode: request.entCode,
            kycDecisionId: request.kycDecision && request.kycDecision.decisionId,
            counts: {
                entries: aggregate.entries.length,
                deliveryGroups: aggregate.deliveryGroups.length,
                paymentGroups: aggregate.paymentGroups.length,
                deliveryAllocations: aggregate.deliveryAllocations.length,
                paymentAllocations: aggregate.paymentAllocations.length,
            },
        };
    },
};
