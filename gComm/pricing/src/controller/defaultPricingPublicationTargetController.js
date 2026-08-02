/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/controller/DefaultPricingPublicationTargetController @description Service-token-only Online Pricing deployment endpoints. @layer controller @owner pricing */
module.exports = {
    /** Initializes the Pricing target controller. */ init: function () { return Promise.resolve(true); },
    /** Completes Pricing target controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Maps the HTTP body and callback contract to one target-local Pricing operation. */
    invoke: function (operation, request, callback) {
        request.body = request.httpRequest && request.httpRequest.body || request.body || {};
        request.correlationId = request.body.correlationId || request.correlationId || request.requestId;
        let promise = SERVICE.DefaultPricingPublicationTargetService[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, { code: 'SUC_SYS_00000', result: result || null })).catch(callback);
    },
    /** Imports and activates one immutable Pricing release. */ deploy: function (request, callback) { return this.invoke('deploy', request, callback); },
    /** Returns target-local Online Pricing status. */ status: function (request, callback) { return this.invoke('getStatus', request, callback); },
    /** Restores a previously deployed Pricing release. */ rollback: function (request, callback) { return this.invoke('rollback', request, callback); }
};
