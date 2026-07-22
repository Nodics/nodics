/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module store/service/reference/DefaultStoreReferenceService @description Exposes one bounded enterprise-scoped Store projection to authenticated Nodics modules. @layer service @owner store @override Projects may extend safe fields while preserving service-only access, Store authority, and bounded enterprise lookup. */
module.exports = {
    /** Initializes reference lookup. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Resolves one active Store. */ resolve: async function (request) { let policy = (CONFIG.get('store') || {}).referenceLookup || {}, auth = request && request.authData || {}; if (policy.requireServiceToken !== false && auth.tokenType !== 'service') throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00012', 'Store reference requires service identity'); let enterpriseCode = SERVICE.DefaultStoreEnterpriseScopeService.resolveEnterpriseCode(request), storeCode = SERVICE.DefaultStoreEnterpriseScopeService.validateBusinessCode(request.body && request.body.storeCode, 'Store'), response = await SERVICE.DefaultStoreService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: enterpriseCode, storeCode: storeCode, status: 'ACTIVE' }, searchOptions: { limit: Number(policy.maximumResultCount || 1) + 1 } }), items = response && Array.isArray(response.result) ? response.result : []; if (items.length !== 1) return { found: false, storeCode: storeCode }; let store = items[0]; return { found: true, store: { storeCode: store.storeCode, name: store.name, type: store.type, countryCode: store.countryCode, timezone: store.timezone, channels: store.channels || [], capabilities: store.capabilities || [], status: store.status } }; }
};
