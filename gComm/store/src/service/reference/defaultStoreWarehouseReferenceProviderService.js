/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/service/reference/DefaultStoreWarehouseReferenceProviderService
 * @description Resolves Inventory-owned Warehouse references locally when co-hosted or through secured Nodics module communication when remote.
 * @layer service
 * @owner store
 * @override Projects may replace topology selection while preserving Inventory authority, authenticated scope, bounded reads, and fail-closed validation.
 */
module.exports = {
    /** Initializes the provider. */ init: function () { return Promise.resolve(true); },
    /** Completes provider initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns effective reference-provider configuration. */
    configuration: function () { return ((CONFIG.get('store') || {}).warehouseReference) || {}; },
    /** Extracts generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns true when the Inventory generated service is active in this runtime. */
    isLocal: function () {
        return this.configuration().preferLocal !== false && SERVICE.DefaultWarehouseService &&
            typeof SERVICE.DefaultWarehouseService.get === 'function';
    },
    /** Validates a safe Inventory projection against the requested authenticated scope. */
    validateProjection: function (projection, enterpriseCode, warehouseCode) {
        if (!projection || projection.enterpriseCode !== enterpriseCode || projection.warehouseCode !== warehouseCode ||
            projection.status === 'RETIRED') {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00005', 'Assignment requires one non-retired Warehouse in the authenticated enterprise');
        }
        return projection;
    },
    /** Resolves through the co-hosted Inventory generated service. */
    resolveLocal: async function (request, enterpriseCode, warehouseCode) {
        let response = await SERVICE.DefaultWarehouseService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, warehouseCode: warehouseCode }, searchOptions: { limit: 2 } });
        let items = this.items(response);
        if (items.length !== 1) throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00005', 'Inventory Warehouse reference is unavailable');
        return this.validateProjection(items[0], enterpriseCode, warehouseCode);
    },
    /** Resolves through the authenticated, read-only Inventory intent route. */
    resolveRemote: async function (request, enterpriseCode, warehouseCode) {
        let config = this.configuration(); let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00005', 'Internal service token is unavailable for Inventory lookup');
        try {
            let response = await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                moduleName: config.moduleName || 'inventory', apiVersion: config.apiVersion || 'v0',
                apiName: config.apiName || '/references/warehouses/resolve', methodName: 'POST',
                header: { Authorization: 'Bearer ' + token, 'x-enterprise-code': enterpriseCode },
                requestBody: { warehouseCode: warehouseCode }, timeoutMs: Number(config.requestTimeoutMs || 2000),
                maxAttempts: Number(config.maximumAttempts || 2), responseType: true
            }));
            return this.validateProjection(response && response.data, enterpriseCode, warehouseCode);
        } catch (error) {
            throw SERVICE.DefaultStoreEnterpriseScopeService.error('ERR_STORE_00005', 'Remote Inventory Warehouse reference is unavailable');
        }
    },
    /** Selects local or remote resolution without creating another Warehouse authority. */
    resolve: function (request, warehouseCode) {
        let enterpriseCode = SERVICE.DefaultStoreEnterpriseScopeService.resolveEnterpriseCode(request);
        warehouseCode = SERVICE.DefaultStoreEnterpriseScopeService.validateBusinessCode(warehouseCode, 'Warehouse');
        return this.isLocal() ? this.resolveLocal(request, enterpriseCode, warehouseCode) :
            this.resolveRemote(request, enterpriseCode, warehouseCode);
    }
};
