/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
