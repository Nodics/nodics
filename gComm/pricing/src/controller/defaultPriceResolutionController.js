/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/controller/DefaultPriceResolutionController @description Maps internal or Storefront-context requests to the authoritative cached Online Price resolver. @layer controller @owner pricing */
module.exports = {
    /** Initializes the Pricing resolution transport adapter. */
    init: function () { return Promise.resolve(true); },
    /** Completes Pricing resolution transport initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves a service-authenticated Pricing intent. */
    resolve: function (request) { return SERVICE.DefaultPriceResolutionFacade.resolve(request); },
    /** Resolves a public delivery intent only after replacing caller scope with trusted Storefront context. */
    resolveStorefront: function (request) {
        return SERVICE.DefaultPricingStorefrontContextProviderService.apply(request)
            .then(() => SERVICE.DefaultPriceResolutionFacade.resolve(request));
    }
};
