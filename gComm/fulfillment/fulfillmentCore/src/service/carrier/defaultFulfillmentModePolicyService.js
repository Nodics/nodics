/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/service/carrier/DefaultFulfillmentModePolicyService
 * @description Resolves shipping mode policy independently from carrier provider implementation.
 * @layer service
 * @owner fulfillment
 * @override Customer modules may layer or persist shipping modes such as same-day, store pickup, ship-to-store, or regional carrier programs without changing Order or Fulfillment release code.
 */
module.exports = {
    /** Initializes shipping mode policy. */
    init: function () { return Promise.resolve(true); },
    /** Completes shipping mode policy startup. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered Fulfillment policy. */
    policy: function () { return ((CONFIG.get('fulfillment') || {}).fulfillmentPolicy) || {}; },
    /** Creates a stable shipping mode error. */
    error: function (message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, 'ERR_FUL_00006');
        let error = new Error(message);
        error.code = 'ERR_FUL_00006';
        return error;
    },
    /** Returns configured mode definitions. */
    modes: function () {
        return this.policy().modes || {};
    },
    /** Resolves one shipping mode definition. */
    mode: function (deliveryModeCode) {
        let code = String(deliveryModeCode || '').trim();
        if (!code) throw this.error('Fulfillment mode code is required');
        let configured = this.modes()[code];
        if (configured) return Object.assign({ modeCode: code }, configured);
        return {
            modeCode: code,
            displayName: code,
            defaultCarrierCode: undefined,
            carrierRequired: true,
            labelRequired: false,
            allowedProviderTypes: [],
        };
    },
};
