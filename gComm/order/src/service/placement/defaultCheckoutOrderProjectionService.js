/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/placement/DefaultCheckoutOrderProjectionService
 * @description Creates an Order header and Order Entries from validated Cart checkout evidence during checkout placement.
 * @layer service
 * @owner order
 * @override Project modules may override code generation, order-header projection, entry projection, or idempotency rules while preserving Cart source traceability.
 */
module.exports = {
    /** Initializes checkout order projection. */
    init: function () { return Promise.resolve(true); },
    /** Completes checkout order projection startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered checkout order projection configuration. */
    config: function () { return ((((CONFIG.get('order') || {}).checkoutPlacement || {}).orderProjection) || {}); },
    /** Creates a stable checkout order projection error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_ORD_00024');
        let error = new Error(message);
        error.code = 'ERR_ORD_00024';
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
    /** Builds stable order code from checkout idempotency. */
    orderCode: function (request) {
        return request.orderCode || [this.config().orderCodePrefix || 'order', request.idempotencyKey || request.workflowCarrier && request.workflowCarrier.code || request.cartCode].filter(Boolean).join('::');
    },
    /** Builds stable order refCode from checkout idempotency. */
    refCode: function (request) {
        return request.refCode || [this.config().refCodePrefix || 'checkout', request.idempotencyKey || request.workflowCarrier && request.workflowCarrier.code || request.cartCode].filter(Boolean).join('::');
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
    /** Loads cart header from preloaded aggregate or generated Cart service. */
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
        if (carts.length > 1) throw this.error('Checkout order projection cart lookup resolved multiple records');
        return carts[0];
    },
    /** Loads cart entries from preloaded aggregate or generated Cart Entry service. */
    loadEntries: async function (request) {
        return this.loadByCart('DefaultCartEntryService', request, 'cartEntries');
    },
    /** Loads an existing idempotent order projection if one already exists. */
    existingOrder: async function (request, code) {
        if (!SERVICE.DefaultOrderService || typeof SERVICE.DefaultOrderService.get !== 'function') return undefined;
        let response = await SERVICE.DefaultOrderService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { code: code },
            searchOptions: { limit: 2 },
        });
        let orders = this.items(response);
        if (orders.length > 1) throw this.error('Checkout order projection resolved multiple orders for the same code');
        return orders[0];
    },
    /** Builds an Order header projection from the Cart header. */
    buildOrder: function (cart, request, code) {
        let source = cart || {};
        return {
            code: code,
            active: true,
            entCode: request.entCode,
            refCode: this.refCode(request),
            status: this.config().orderStatus || 'PLACED',
            cartCode: request.cartCode,
            sourceCartCode: request.cartCode,
            workflowCarrierCode: request.workflowCarrier && request.workflowCarrier.code,
            placementCode: request.placementCode || request.idempotencyKey,
            currencyCode: source.currencyCode,
        };
    },
    /** Persists the Order header through the generated Order service. */
    saveOrder: async function (request, order) {
        if (!SERVICE.DefaultOrderService || typeof SERVICE.DefaultOrderService.save !== 'function') {
            throw this.error('Order generated service is unavailable');
        }
        let response = await SERVICE.DefaultOrderService.save({
            tenant: request.tenant,
            authData: request.authData,
            model: order,
        });
        return this.items(response)[0] || response.result || order;
    },
    /** Builds Order Entries through the existing Order Entry policy service. */
    buildEntries: function (entries, order, request) {
        if (!SERVICE.DefaultOrderEntryPolicyService || typeof SERVICE.DefaultOrderEntryPolicyService.buildFromCartEntries !== 'function') {
            throw this.error('Order Entry policy service is unavailable');
        }
        return SERVICE.DefaultOrderEntryPolicyService.buildFromCartEntries(entries, {
            orderCode: order.code,
            status: this.config().entryStatus || 'ORDERED',
        }).map((entry) => Object.assign({}, entry, {
            cartCode: entry.cartCode || request.cartCode,
        }));
    },
    /** Persists projected Order Entries through the generated Order Entry service. */
    saveEntries: async function (request, entries) {
        if (!SERVICE.DefaultOrderEntryService || typeof SERVICE.DefaultOrderEntryService.save !== 'function') {
            throw this.error('Order Entry generated service is unavailable');
        }
        let saved = [];
        for (let entry of entries) {
            let response = await SERVICE.DefaultOrderEntryService.save({
                tenant: request.tenant,
                authData: request.authData,
                model: entry,
            });
            saved.push(this.items(response)[0] || response.result || entry);
        }
        return saved;
    },
    /** Creates an idempotent Order header and Entries from validated Cart checkout evidence. */
    create: async function (request) {
        if ((this.config().enabled === false)) return { skipped: true, reason: 'ORDER_PROJECTION_DISABLED' };
        if (!request || !request.tenant || !request.authData || !request.cartCode || !request.entCode) {
            throw this.error('Checkout order projection requires tenant, auth, cartCode, and entCode');
        }
        let code = this.orderCode(request);
        let existing = await this.existingOrder(request, code);
        if (existing) return { order: existing, entries: [], idempotent: true };
        let cart = await this.loadCart(request);
        if (!cart || cart.code !== request.cartCode) throw this.error('Checkout order projection cart is unavailable');
        if (cart.entCode && cart.entCode !== request.entCode) throw this.error('Checkout order projection cart enterprise does not match request');
        let cartEntries = await this.loadEntries(request);
        if (!cartEntries.length) throw this.error('Checkout order projection requires cart entries');
        let order = await this.saveOrder(request, this.buildOrder(cart, request, code));
        let entries = await this.saveEntries(request, this.buildEntries(cartEntries, order, request));
        return { order: order, entries: entries, idempotent: false };
    },
};
