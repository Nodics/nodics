/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/reference/DefaultStorefrontCatalogReferenceProviderService
 * @description Reuses nCatalog to validate Storefront product-catalog references without creating another catalog registry.
 * @layer service
 * @owner storefront
 * @override Later modules may decorate validation while nCatalog remains authoritative.
 */
module.exports = {
    /** Initializes catalog reference validation. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes catalog reference provider initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Validates one active catalog through nCatalog. */
    validate: async function (request, code) {
        if (!SERVICE.DefaultCatalogService || typeof SERVICE.DefaultCatalogService.get !== 'function')
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'Catalog authority is unavailable'
            );
        let response = await SERVICE.DefaultCatalogService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: { code: code, active: true },
                searchOptions: {
                    limit: Number(((CONFIG.get('storefront') || {}).catalogReference || {}).maximumResults || 2)
                }
            }),
            items = response && Array.isArray(response.result) ? response.result : [];
        if (items.length !== 1 || items[0].code !== code)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error(
                'ERR_STOREFRONT_00005',
                'Catalog reference is unavailable'
            );
        return { catalogCode: code };
    }
};
