/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/placement/DefaultCheckoutInventoryReservationService
 * @description Converts checkout delivery allocation demand into Inventory-owned Promise Reservation requests during checkout placement.
 * @layer service
 * @owner order
 * @override Project modules may override allocation source selection, promise-code mapping, idempotency format, or reservation filtering while keeping Inventory as the promise counter authority.
 */
module.exports = {
    /** Initializes checkout inventory reservation bridge. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout inventory reservation bridge startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered checkout inventory reservation configuration. */
    config: function () { return ((((CONFIG.get('order') || {}).checkoutPlacement || {}).inventoryReservation) || {}); },
    /** Creates a stable checkout inventory reservation error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_ORD_00023');
        let error = new Error(message);
        error.code = 'ERR_ORD_00023';
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
            searchOptions: { limit: Number(this.config().maximumAggregateRecords || 1000) },
        });
        return this.items(response);
    },
    /** Returns cart entries used for promise-code fallback and demand line context. */
    entries: async function (request) {
        return this.loadByCart('DefaultCartEntryService', request, 'cartEntries');
    },
    /** Returns checkout allocations that drive inventory promise demand. */
    allocations: async function (request) {
        let source = this.config().allocationSource || 'delivery';
        if (source === 'payment') return this.loadByCart('DefaultCartPaymentAllocationService', request, 'cartPaymentAllocations');
        return this.loadByCart('DefaultCartDeliveryAllocationService', request, 'cartDeliveryAllocations');
    },
    /** Resolves configured promise code from allocation first, then entry. */
    promiseCode: function (allocation, entry) {
        let fields = this.config().promiseCodeFields || ['promiseCode', 'inventoryPromiseCode'];
        for (let field of fields) {
            if (allocation && allocation[field]) return allocation[field];
            if (entry && entry[field]) return entry[field];
        }
        return undefined;
    },
    /** Builds stable idempotency key for one checkout allocation reservation. */
    idempotencyKey: function (request, allocation, promiseCode) {
        return [
            request.idempotencyKey || request.workflowCarrier && request.workflowCarrier.code || request.cartCode,
            request.cartCode,
            allocation.entryCode,
            allocation.allocationCode,
            promiseCode,
        ].filter(Boolean).join('::');
    },
    /** Builds one Inventory Promise Reservation request from checkout allocation demand. */
    reservationInput: function (request, allocation, entry, promiseCode) {
        return {
            idempotencyKey: this.idempotencyKey(request, allocation, promiseCode),
            promiseCode: promiseCode,
            demandType: this.config().demandType || 'CART',
            demandCode: request.cartCode,
            demandLineCode: allocation.entryCode,
            checkoutAllocationCode: allocation.allocationCode,
            entryCode: allocation.entryCode,
            quantity: allocation.quantity,
            reasonCode: allocation.reasonCode || this.config().defaultReasonCode || 'CHECKOUT_PLACEMENT',
            correlationId: request.correlationId || request.idempotencyKey || request.workflowCarrier && request.workflowCarrier.code,
        };
    },
    /** Reserves Inventory Promise capacity for configured checkout allocations through Inventory-owned orchestration. */
    reserve: async function (request) {
        if ((this.config().enabled === false)) return { reserved: [], skipped: [], disabled: true };
        if (!request || !request.tenant || !request.authData || !request.cartCode || !request.entCode) {
            throw this.error('Checkout inventory reservation requires tenant, auth, cartCode, and entCode');
        }
        let entries = await this.entries(request);
        let entryByCode = new Map(entries.map((entry) => [entry.entryCode, entry]));
        let allocations = await this.allocations(request);
        let reserved = [];
        let skipped = [];
        let candidates = [];
        allocations.forEach((allocation) => {
            let entry = entryByCode.get(allocation.entryCode) || {};
            let promiseCode = this.promiseCode(allocation, entry);
            if (!promiseCode) {
                skipped.push({ allocationCode: allocation.allocationCode, entryCode: allocation.entryCode, reason: 'NO_PROMISE_CODE' });
                return;
            }
            candidates.push({ allocation, entry, promiseCode });
        });
        if (!candidates.length) return { reserved: [], skipped: skipped, count: 0 };
        if (!SERVICE.DefaultInventoryPromiseReservationOrchestrationService ||
            typeof SERVICE.DefaultInventoryPromiseReservationOrchestrationService.reserve !== 'function') {
            throw this.error('Inventory Promise Reservation orchestration is unavailable');
        }
        for (let candidate of candidates) {
            let reservation = await SERVICE.DefaultInventoryPromiseReservationOrchestrationService.reserve({
                tenant: request.tenant,
                authData: request.authData,
                enterpriseCode: request.entCode,
                promiseReservation: this.reservationInput(request, candidate.allocation, candidate.entry, candidate.promiseCode),
            });
            reserved.push({
                code: reservation.code,
                promiseReservationCode: reservation.promiseReservationCode,
                promiseCode: reservation.promiseCode,
                checkoutAllocationCode: reservation.checkoutAllocationCode,
                demandLineCode: reservation.demandLineCode,
                promiseBucket: reservation.promiseBucket,
                quantity: reservation.quantity,
                paymentRequirement: reservation.paymentRequirement,
                commercialPolicyCode: reservation.commercialPolicyCode,
                state: reservation.state,
            });
        }
        return { reserved: reserved, skipped: skipped, count: reserved.length };
    },
};
