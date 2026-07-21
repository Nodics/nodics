/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/reference/DefaultProductItemReferenceService @description Exposes a bounded service-token-only Product Item projection to Pricing, Inventory, and other modules. @layer service @owner product */
module.exports = {
    /** Initializes Product Item reference lookup. */ init: function () { return Promise.resolve(true); },
    /** Completes Product Item reference initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Resolves one active Product Item through trusted service identity. */ resolve: async function (request) {
        let auth = request && request.authData || {}, input = request.body || {};
        if (auth.tokenType !== 'service') throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00030', 'Product reference lookup requires service identity');
        let enterpriseCode = SERVICE.DefaultProductEnterpriseScopeService.resolveEnterpriseCode(request), policy = (CONFIG.get('product') || {}).referenceLookup || {};
        ['catalogCode', 'itemType', 'itemCode'].forEach(field => SERVICE.DefaultProductEnterpriseScopeService.validateBusinessCode(input[field], 'Product ' + field));
        if (!(policy.allowedItemTypes || []).includes(input.itemType)) throw SERVICE.DefaultProductEnterpriseScopeService.error('ERR_PRODUCT_00031', 'Product reference item type is invalid');
        let response = await SERVICE.DefaultProductItemService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: enterpriseCode, catalogCode: input.catalogCode, itemType: input.itemType, itemCode: input.itemCode, status: 'ACTIVE' }, searchOptions: { limit: 2 } }), items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1) return { found: false, catalogCode: input.catalogCode, itemType: input.itemType, itemCode: input.itemCode };
        let item = items[0]; return { found: true, item: { catalogCode: item.catalogCode, itemType: item.itemType, itemCode: item.itemCode, name: item.name, baseUnitCode: item.baseUnitCode, sellable: item.sellable, stockManaged: item.stockManaged, status: item.status } };
    }
};
