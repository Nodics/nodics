/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/reference/DefaultPricingReferenceService @description Delegates reference validation to configured authoritative providers. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the asynchronous validate Pricing contract. */
    validate: async function (kind, code, request) {
        if (!code) return true; let config = ((CONFIG.get('pricing') || {}).references || {}), providerName = (config.providers || {})[kind];
        if (!providerName) return config.requireValidationWhenConfigured !== false;
        let provider = SERVICE[providerName]; if (!provider || typeof provider.validate !== 'function') throw SERVICE.DefaultPricingEnterpriseScopeService.error('ERR_PRICE_00020', 'Configured ' + kind + ' reference provider is unavailable');
        let valid = await provider.validate({ tenant: request.tenant, authData: request.authData, enterpriseCode: request.model.enterpriseCode, code: code, kind: kind });
        if (!valid) throw SERVICE.DefaultPricingEnterpriseScopeService.error('ERR_PRICE_00021', kind + ' reference is invalid'); return true;
    }
};
