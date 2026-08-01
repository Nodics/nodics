/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const checkoutEntryPolicy = require('../../utils/checkoutEntryPolicy');

/**
 * @module cart/service/entry/DefaultCartEntryPolicyService
 * @description Validates Cart Entry identity, exact quantity and money evidence, parent ownership, and update lifecycle without owning Product, Pricing, Inventory, Tax, Payment, or Fulfillment rules.
 * @layer service
 * @owner cart
 * @override Project modules may override cart.checkoutEntry.policy or replace this service to enforce customer-specific Cart Entry rules.
 */
module.exports = {
    /** Initializes Cart Entry policy validation. */
    init: function () { return Promise.resolve(true); },
    /** Completes Cart Entry policy validation startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Cart Entry policy. */
    policy: function () { return (((CONFIG.get('cart') || {}).checkoutEntry || {}).policy) || {}; },
    /** Creates a stable Cart Entry policy error. */
    error: function (message) { return new CLASSES.NodicsError(message, null, 'ERR_ORD_00001'); },
    /** Validates a Cart Entry payload before persistence or import. */
    validateEntry: function (request) {
        const result = checkoutEntryPolicy.validateEntry((request || {}).model, this.policy(), { parentField: 'cartCode' });
        if (!result.valid) throw this.error(result.errors.join('; '));
        request.model = result.model;
        return result.model;
    },
    /** Validates immutable Cart Entry updates and lifecycle transitions. */
    validateUpdate: function (current, patch) {
        const errors = checkoutEntryPolicy.validateUpdate(current, patch, this.policy());
        if (errors.length) throw this.error(errors.join('; '));
        return true;
    },
    /** Validates a collection of Cart Entries. */
    validateEntries: function (entries) {
        return (entries || []).map((entry) => checkoutEntryPolicy.validateEntry(entry, this.policy(), { parentField: 'cartCode' }));
    },
};
