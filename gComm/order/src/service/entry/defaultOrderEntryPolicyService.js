/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const checkoutEntryPolicy = require('../../../../cart/src/utils/checkoutEntryPolicy');

/**
 * @module order/service/entry/DefaultOrderEntryPolicyService
 * @description Validates Order Entry immutable evidence and builds Order Entries from Cart Entries through the shared checkout entry policy.
 * @layer service
 * @owner order
 * @override Project modules may override order.checkoutEntry.policy or replace this service to enforce customer-specific Order Entry conversion and lifecycle rules.
 */
module.exports = {
    /** Initializes Order Entry policy validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Order Entry policy validation startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Order Entry policy. */
    policy: function () { return (((CONFIG.get('order') || {}).checkoutEntry || {}).policy) || {}; },
    /** Creates a stable Order Entry policy error. */
    error: function (message) { return new CLASSES.NodicsError(message, null, 'ERR_ORD_00001'); },
    /** Validates an Order Entry payload before persistence or import. */
    prepareEntry: function (request) {
        const result = checkoutEntryPolicy.validateEntry((request || {}).model, this.policy(), { parentField: 'orderCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Backward-compatible alias for direct service consumers. */
    validateEntry: function (request) {
        return this.prepareEntry(request);
    },
    /** Loads the current Order Entry for an update request. */
    loadCurrent: async function (request) {
        const service = SERVICE.DefaultOrderEntryService;
        if (!service || typeof service.get !== 'function') throw this.error('Order Entry generated service is unavailable');
        const response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: request.query,
            searchOptions: { limit: 2 },
        });
        const items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1) throw this.error('Order Entry update target must resolve exactly one record');
        return items[0];
    },
    /** Validates immutable Order Entry update payloads before persistence. */
    prepareEntryUpdate: async function (request) {
        const current = request.currentModel || await this.loadCurrent(request);
        this.validateUpdate(current, request.model || {});
        return true;
    },
    /** Validates immutable Order Entry updates and lifecycle transitions. */
    validateUpdate: function (current, patch) {
        const errors = checkoutEntryPolicy.validateUpdate(current, patch, this.policy());
        if (errors.length) throw this.error(errors.join('; '));
        return true;
    },
    /** Builds one Order Entry from one Cart Entry while preserving configured exact evidence fields. */
    buildFromCartEntry: function (cartEntry, orderContext) {
        const entry = checkoutEntryPolicy.buildOrderEntryFromCartEntry(cartEntry, orderContext, this.policy());
        const result = checkoutEntryPolicy.validateEntry(entry, Object.assign({}, this.policy(), {
            statuses: ['ORDERED', 'ALLOCATED', 'CANCELLED', 'RETURNED'],
        }), { parentField: 'orderCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        return result.model;
    },
    /** Builds many Order Entries from Cart Entries. */
    buildFromCartEntries: function (cartEntries, orderContext) {
        return (cartEntries || []).map((entry) => this.buildFromCartEntry(entry, orderContext));
    },
    /** Rejects destructive Order Entry deletion; callers must retire entries through lifecycle state. */
    rejectHardDelete: function () {
        return Promise.reject(this.error('Order Entry history cannot be hard-deleted; retire it'));
    },
};
