/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/facade/defaultCmsDeliveryFacade
 * @description Replaceable orchestration boundary for resolved CMS delivery.
 * @layer facade
 * @owner cms
 * @override Later modules may replace resolution orchestration without changing the controller or route contract.
 */
module.exports = {
    /** Initializes the facade lifecycle. */
    init: function () { return Promise.resolve(true); },
    /** Completes the facade lifecycle. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates resolved-page orchestration to the active service implementation. */
    resolvePage: function (request) {
        return SERVICE.DefaultCmsDeliveryService.resolvePage(request);
    }
};
