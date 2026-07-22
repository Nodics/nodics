/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/reference/DefaultPricingStoreReferenceProviderService @description Validates Store-scoped Pricing assignments through the Store-owned local or service-token reference contract. @layer service @owner pricing @override Projects may replace transport while preserving Store authority, enterprise scope, and bounded validation. */
module.exports = {
    /** Initializes the provider. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Store reference policy. */ policy: function () { return (CONFIG.get('pricing') || {}).storeReference || {}; },
    /** Validates one Store locally or remotely. */ validate: async function (input) { let policy = this.policy(), request = { tenant: input.tenant, authData: input.authData }, data; if (policy.preferLocal !== false && SERVICE.DefaultStoreService) { let response = await SERVICE.DefaultStoreService.get({ tenant: input.tenant, authData: input.authData, query: { enterpriseCode: input.enterpriseCode, storeCode: input.code, status: 'ACTIVE' }, searchOptions: { limit: 2 } }), items = response && Array.isArray(response.result) ? response.result : []; return items.length === 1; } let token = global.NODICS && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(input.tenant); if (!token) throw SERVICE.DefaultPricingEnterpriseScopeService.error('ERR_PRICE_00020', 'Internal service token is unavailable for Store validation'); let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: policy.moduleName || 'store', apiVersion: policy.apiVersion || 'v0', apiName: policy.apiName || '/references/stores/resolve', method: 'POST', body: { storeCode: input.code }, header: { Authorization: 'Bearer ' + token, 'x-enterprise-code': input.enterpriseCode }, requestTimeoutMs: Number(policy.requestTimeoutMs || 2000), maximumAttempts: Number(policy.maximumAttempts || 2) }), response = await SERVICE.DefaultModuleService.fetch(descriptor); data = response && (response.data && response.data.data || response.data); return Boolean(data && data.found !== false && (data.store || data.storeCode)); }
};
