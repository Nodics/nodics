/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/reference/DefaultProductReferenceService @description Delegates Catalog and Unit reference checks to configured authoritative providers. @layer service @owner product */
module.exports = {
    /** Initializes reference delegation. */ init: function () { return Promise.resolve(true); },
    /** Completes reference initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Validates a reference without copying the owning authority. */ validate: async function (kind, code, request) {
        if (!code) return true;
        let config = (CONFIG.get('product') || {}).references || {}, providerName = (config.providers || {})[kind];
        if (!providerName) return config.requireValidationWhenConfigured !== false;
        let provider = SERVICE[providerName];
        if (!provider || typeof provider.validate !== 'function') throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00020', 'Configured ' + kind + ' reference provider is unavailable');
        let valid = await provider.validate({ tenant: request.tenant, authData: request.authData, enterpriseCode: request.model.enterpriseCode, code: code, kind: kind });
        if (!valid) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00021', kind + ' reference is invalid');
        return true;
    }
};
