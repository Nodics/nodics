/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/service/placement/DefaultCheckoutAllocationCopyService
 * @description Copies exact Cart checkout delivery/payment group and quantity-allocation evidence into Order-owned immutable models during checkout placement.
 * @layer service
 * @owner order
 * @override Project modules may override copy enablement, aggregate loading, code remapping, or persistence services while preserving source cart traceability.
 */
module.exports = {
    /** Initializes checkout allocation copy orchestration. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout allocation copy orchestration startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered checkout allocation-copy configuration. */
    config: function () { return ((((CONFIG.get('order') || {}).checkoutPlacement || {}).allocationCopy) || {}); },
    /** Creates a stable checkout allocation-copy error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_ORD_00025');
        let error = new Error(message);
        error.code = 'ERR_ORD_00025';
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
    /** Resolves the order code created by the preceding Workflow action. */
    orderCode: function (request) {
        let projected = request.orderProjection && (request.orderProjection.order || request.orderProjection.result || request.orderProjection);
        let projectionConfig = (((CONFIG.get('order') || {}).checkoutPlacement || {}).orderProjection || {});
        return request.orderCode ||
            (projected && projected.code) ||
            [projectionConfig.orderCodePrefix || 'order', request.idempotencyKey || request.workflowCarrier && request.workflowCarrier.code || request.cartCode].filter(Boolean).join('::');
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
            searchOptions: { limit: Number(this.config().maximumAggregateRecords || 1000) },
        });
        return this.items(response);
    },
    /** Loads existing order-side copy records to make checkout placement idempotent. */
    existingByOrder: async function (serviceName, request, orderCode) {
        let service = SERVICE[serviceName];
        if (!service || typeof service.get !== 'function') return [];
        let response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { orderCode: orderCode },
            searchOptions: { limit: Number(this.config().maximumAggregateRecords || 1000) },
        });
        return this.items(response);
    },
    /** Persists models sequentially through the generated schema service. */
    saveAll: async function (serviceName, request, models) {
        let service = SERVICE[serviceName];
        if (!service || typeof service.save !== 'function') throw this.error(serviceName + ' generated service is unavailable');
        let saved = [];
        for (let model of models) {
            let response = await service.save({
                tenant: request.tenant,
                authData: request.authData,
                model: model,
            });
            saved.push(this.items(response)[0] || response.result || model);
        }
        return saved;
    },
    /** Filters models that were already copied for the same source code. */
    missingBySource: function (sourceModels, existingModels, sourceField, sourceCodeField) {
        let existing = new Set((existingModels || []).map((item) => item && item[sourceField]).filter(Boolean));
        return (sourceModels || []).filter((model) => model && !existing.has(model[sourceCodeField]));
    },
    /** Builds the reusable order conversion context. */
    context: function (request, orderCode) {
        return {
            orderCode: orderCode,
            status: this.config().targetStatus || 'ORDERED',
            deliveryGroupCodeMap: request.deliveryGroupCodeMap || {},
            paymentGroupCodeMap: request.paymentGroupCodeMap || {},
            allocationCodeMap: request.allocationCodeMap || {},
        };
    },
    /** Copies cart delivery/payment groups and allocations to order scope without recalculating quantities or amounts. */
    copy: async function (request) {
        if (this.config().enabled === false) return { skipped: true, reason: 'ALLOCATION_COPY_DISABLED' };
        if (!request || !request.tenant || !request.authData || !request.cartCode || !request.entCode) {
            throw this.error('Checkout allocation copy requires tenant, auth, cartCode, and entCode');
        }
        if (!SERVICE.DefaultOrderCheckoutAllocationPolicyService) {
            throw this.error('Order checkout allocation policy service is unavailable');
        }
        let orderCode = this.orderCode(request);
        if (!orderCode) throw this.error('Checkout allocation copy requires orderCode or checkout idempotency evidence');
        let context = this.context(request, orderCode);
        let policyService = SERVICE.DefaultOrderCheckoutAllocationPolicyService;

        let cartDeliveryGroups = await this.loadByCart('DefaultCartDeliveryGroupService', request, 'cartDeliveryGroups');
        let cartPaymentGroups = await this.loadByCart('DefaultCartPaymentGroupService', request, 'cartPaymentGroups');
        let cartDeliveryAllocations = await this.loadByCart('DefaultCartDeliveryAllocationService', request, 'cartDeliveryAllocations');
        let cartPaymentAllocations = await this.loadByCart('DefaultCartPaymentAllocationService', request, 'cartPaymentAllocations');

        let existingDeliveryGroups = await this.existingByOrder('DefaultOrderDeliveryGroupService', request, orderCode);
        let existingPaymentGroups = await this.existingByOrder('DefaultOrderPaymentGroupService', request, orderCode);
        let existingDeliveryAllocations = await this.existingByOrder('DefaultOrderDeliveryAllocationService', request, orderCode);
        let existingPaymentAllocations = await this.existingByOrder('DefaultOrderPaymentAllocationService', request, orderCode);

        let deliveryGroups = this.missingBySource(cartDeliveryGroups, existingDeliveryGroups, 'sourceDeliveryGroupCode', 'deliveryGroupCode')
            .map((group) => policyService.buildDeliveryGroupFromCartDeliveryGroup(group, context));
        let paymentGroups = this.missingBySource(cartPaymentGroups, existingPaymentGroups, 'sourcePaymentGroupCode', 'paymentGroupCode')
            .map((group) => policyService.buildPaymentGroupFromCartPaymentGroup(group, context));
        let deliveryAllocations = this.missingBySource(cartDeliveryAllocations, existingDeliveryAllocations, 'sourceAllocationCode', 'allocationCode')
            .map((allocation) => policyService.buildDeliveryAllocationFromCartDeliveryAllocation(allocation, context));
        let paymentAllocations = this.missingBySource(cartPaymentAllocations, existingPaymentAllocations, 'sourceAllocationCode', 'allocationCode')
            .map((allocation) => policyService.buildPaymentAllocationFromCartPaymentAllocation(allocation, context));

        return {
            orderCode: orderCode,
            deliveryGroups: await this.saveAll('DefaultOrderDeliveryGroupService', request, deliveryGroups),
            paymentGroups: await this.saveAll('DefaultOrderPaymentGroupService', request, paymentGroups),
            deliveryAllocations: await this.saveAll('DefaultOrderDeliveryAllocationService', request, deliveryAllocations),
            paymentAllocations: await this.saveAll('DefaultOrderPaymentAllocationService', request, paymentAllocations),
            idempotent: deliveryGroups.length + paymentGroups.length + deliveryAllocations.length + paymentAllocations.length === 0,
        };
    },
};
