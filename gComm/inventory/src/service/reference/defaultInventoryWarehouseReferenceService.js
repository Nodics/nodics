/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module inventory/service/reference/DefaultInventoryWarehouseReferenceService
 * @description Resolves a minimal, authenticated, enterprise-scoped Warehouse projection for module-to-module reference validation.
 * @layer service
 * @owner inventory
 * @override Projects may extend the safe projection while preserving service-only access, scope, bounded lookup, and Inventory authority.
 */
module.exports = {
    /** Initializes Warehouse reference lookup. */
    init: function () { return Promise.resolve(true); },
    /** Completes Warehouse reference lookup initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Extracts generated-service result items. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Validates that only an internal service identity may use the lookup contract. */
    validateServiceIdentity: function (request) {
        let required = (((CONFIG.get('inventory') || {}).referenceLookup || {}).requireServiceToken !== false);
        if (required && (!request.authData || request.authData.tokenType !== 'service')) {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00010', 'Warehouse reference lookup requires an internal service identity');
        }
        return true;
    },
    /** Returns the allow-listed safe projection and never Warehouse internals or credentials. */
    project: function (warehouse) {
        return { enterpriseCode: warehouse.enterpriseCode, warehouseCode: warehouse.warehouseCode,
            status: warehouse.status, type: warehouse.type, countryCode: warehouse.countryCode,
            capabilities: Array.isArray(warehouse.capabilities) ? warehouse.capabilities.slice() : [] };
    },
    /** Resolves one non-retired Warehouse inside authenticated enterprise and tenant scope. */
    resolve: async function (request) {
        this.validateServiceIdentity(request);
        let enterpriseCode = SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(request);
        let warehouseCode = SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(request.body && request.body.warehouseCode, 'Warehouse');
        let maximum = Number((((CONFIG.get('inventory') || {}).referenceLookup || {}).maximumResultCount) || 1);
        let response = await SERVICE.DefaultWarehouseService.get({ tenant: request.tenant, authData: request.authData,
            query: { enterpriseCode: enterpriseCode, warehouseCode: warehouseCode }, searchOptions: { limit: Math.max(1, maximum + 1) } });
        let items = this.items(response);
        if (items.length !== 1 || items[0].status === 'RETIRED') {
            throw SERVICE.DefaultInventoryEnterpriseScopeService.error('ERR_INV_00009', 'Warehouse reference was not found or is unavailable');
        }
        return { code: 'SUC_INV_00001', data: this.project(items[0]) };
    }
};
