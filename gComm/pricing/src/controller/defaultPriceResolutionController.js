/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
