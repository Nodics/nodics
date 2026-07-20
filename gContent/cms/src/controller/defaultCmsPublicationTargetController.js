/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/controller/DefaultCmsPublicationTargetController
 * @description Maps internal authenticated Staged-to-Online release operations to the target-local CMS deployment service.
 * @layer controller
 * @owner cms
 * @override Online project modules may replace request mapping while retaining internal-token and target-operation boundaries.
 */
module.exports = {
    /** Invokes one target-local publication operation. */
    invoke: function (operation, request, callback) {
        request.cmsPublicationTarget = request.httpRequest && request.httpRequest.body || request.cmsPublicationTarget || {};
        request.correlationId = request.cmsPublicationTarget.correlationId || request.correlationId || request.requestId;
        let promise = SERVICE.DefaultCmsPublicationTargetService[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, { code: 'SUC_SYS_00000', result: result || null })).catch(callback);
    },
    /** Imports and activates one immutable release. */
    deploy: function (request, callback) { return this.invoke('deploy', request, callback); },
    /** Returns target-local Online release status. */
    getStatus: function (request, callback) { return this.invoke('getStatus', request, callback); },
    /** Restores a previously deployed target release. */
    rollback: function (request, callback) { return this.invoke('rollback', request, callback); }
};
