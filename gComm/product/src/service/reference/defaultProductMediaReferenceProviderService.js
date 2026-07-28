/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/reference/DefaultProductMediaReferenceProviderService @description Validates Product media assignments through nMedia-owned media item and media set references. @layer service @owner product */
module.exports = {
    /** Initializes media reference validation. */ init: function () { return Promise.resolve(true); },
    /** Completes media reference validation initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns media provider configuration. */ config: function () { return (CONFIG.get('product') || {}).mediaReference || {}; },
    /** Reports whether nMedia is locally composed. */ local: function () { return this.config().preferLocal !== false && SERVICE.DefaultMediaReferenceLookupService && typeof SERVICE.DefaultMediaReferenceLookupService.validateInternal === 'function'; },
    /** Resolves the nMedia reference type from Product reference kind. */
    referenceType: function (kind) { return kind === 'mediaSet' ? 'MEDIA_SET' : 'MEDIA'; },
    /** Validates one nMedia reference without copying media lifecycle authority into Product. */
    validate: async function (input) {
        let body = { referenceType: this.referenceType(input.kind), referenceCode: input.code }, result;
        if (this.local()) result = await SERVICE.DefaultMediaReferenceLookupService.validateInternal({ tenant: input.tenant, authData: input.authData, body: body });
        else {
            let config = this.config(), token = NODICS.getInternalAuthToken(input.tenant);
            if (!token) throw new CLASSES.NodicsError('ERR_PRODUCT_00020', 'Media service token is unavailable');
            let response = await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({ moduleName: config.moduleName || 'media', apiVersion: config.apiVersion || 'v0', apiName: config.apiName || '/references/media/validate', methodName: 'POST', requestBody: body, timeoutMs: Number(config.requestTimeoutMs || 2000), maxAttempts: Number(config.maximumAttempts || 2), header: { Authorization: 'Bearer ' + token, 'x-enterprise-code': input.enterpriseCode } }));
            result = response && (response.data || response.result);
        }
        return Boolean(result && result.referenceType === body.referenceType && result.code === input.code);
    }
};
