/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/reference/DefaultPricingUnitsReferenceProviderService @description Validates Unit references through the Units-owned intent contract. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the config Pricing contract. */
    config: function () { return (CONFIG.get('pricing') || {}).unitsReference || {}; },
    /** Executes the local Pricing contract. */
    local: function () { return this.config().preferLocal !== false && SERVICE.DefaultUnitsReferenceService && typeof SERVICE.DefaultUnitsReferenceService.convertInternal === 'function'; },
    /** Executes the asynchronous validate Pricing contract. */
    validate: async function (input) { let body = { fromUnitCode: input.code, toUnitCode: input.code, quantity: '1', targetScale: 0, roundingMode: 'UNNECESSARY' }, result;
        if (this.local()) result = await SERVICE.DefaultUnitsReferenceService.convertInternal({ tenant: input.tenant, authData: input.authData, body: body });
        else { let config = this.config(), token = NODICS.getInternalAuthToken(input.tenant); if (!token) throw new CLASSES.NodicsError('ERR_PRICE_00020', 'Units service token is unavailable'); let response = await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({ moduleName: config.moduleName || 'units', apiVersion: config.apiVersion || 'v0', apiName: config.apiName || '/references/units/convert', methodName: 'POST', requestBody: body, timeoutMs: Number(config.requestTimeoutMs || 2000), maxAttempts: Number(config.maximumAttempts || 2), header: { Authorization: 'Bearer ' + token, 'x-enterprise-code': input.enterpriseCode } })); result = response && (response.data || response.result); }
        return Boolean(result && result.fromUnit && result.toUnit && result.fromUnit.unitCode === input.code && result.toUnit.unitCode === input.code);
    }
};
