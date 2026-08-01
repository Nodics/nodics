/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
    validateEntry: function (request) {
        const result = checkoutEntryPolicy.validateEntry((request || {}).model, this.policy(), { parentField: 'orderCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
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
};
