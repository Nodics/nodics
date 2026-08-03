/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/reference/DefaultProductCatalogReferenceProviderService @description Validates catalog codes against the existing nCatalog service without introducing another catalog registry. @layer service @owner product */
module.exports = {
    /** Initializes Catalog reference validation. */ init: function () { return Promise.resolve(true); },
    /** Completes Catalog reference initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns Catalog reference policy. */ config: function () { return (CONFIG.get('product') || {}).catalogReference || {}; },
    /** Validates an active Catalog using the locally composed nCatalog authority. */ validate: async function (input) {
        if (!SERVICE.DefaultCatalogService || typeof SERVICE.DefaultCatalogService.get !== 'function') throw new CLASSES.NodicsError('ERR_PRODUCT_00020', 'Catalog authority is not active in this module composition');
        let response = await SERVICE.DefaultCatalogService.get({ tenant: input.tenant, authData: input.authData, query: { code: input.code, active: true }, searchOptions: { limit: Number(this.config().maximumResults || 2) } });
        let items = response && Array.isArray(response.result) ? response.result : [];
        return items.length === 1 && items[0].code === input.code;
    }
};
