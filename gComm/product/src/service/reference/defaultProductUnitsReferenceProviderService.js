/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/reference/DefaultProductUnitsReferenceProviderService @description Validates Unit references through the Units-owned local or modular intent contract. @layer service @owner product */
module.exports = {
    /** Initializes Units reference validation. */ init: function () { return Promise.resolve(true); },
    /** Completes Units reference initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Units provider configuration. */ config: function () { return (CONFIG.get('product') || {}).unitsReference || {}; },
    /** Reports whether the Units authority is locally composed. */ local: function () { return this.config().preferLocal !== false && SERVICE.DefaultUnitsReferenceService && typeof SERVICE.DefaultUnitsReferenceService.convertInternal === 'function'; },
    /** Validates one Unit code through an exact identity conversion. */ validate: async function (input) {
        let body = { fromUnitCode: input.code, toUnitCode: input.code, quantity: '1', targetScale: 0, roundingMode: 'UNNECESSARY' }, result;
        if (this.local()) result = await SERVICE.DefaultUnitsReferenceService.convertInternal({ tenant: input.tenant, authData: input.authData, body: body });
        else {
            let config = this.config(), token = NODICS.getInternalAuthToken(input.tenant);
            if (!token) throw new CLASSES.NodicsError('ERR_PRODUCT_00020', 'Units service token is unavailable');
            let response = await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({ moduleName: config.moduleName || 'units', apiVersion: config.apiVersion || 'v0', apiName: config.apiName || '/references/units/convert', methodName: 'POST', requestBody: body, timeoutMs: Number(config.requestTimeoutMs || 2000), maxAttempts: Number(config.maximumAttempts || 2), header: { Authorization: 'Bearer ' + token, 'x-enterprise-code': input.enterpriseCode } }));
            result = response && (response.data || response.result);
        }
        return Boolean(result && result.fromUnit && result.toUnit && result.fromUnit.unitCode === input.code && result.toUnit.unitCode === input.code);
    }
};
