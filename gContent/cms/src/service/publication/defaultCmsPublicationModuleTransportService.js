/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationModuleTransportService
 * @description Sends authenticated release operations from Staged CMS to a separately configured Online CMS module runtime.
 * @layer service
 * @owner cms
 * @override Projects may replace transport while retaining internal authentication, retry safety, idempotency, and sanitized diagnostics.
 */
module.exports = {
    /** Initializes CMS target transport. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS target transport initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Sends one authenticated operation to the configured Online CMS module. */
    send: function (operation, payload, request) {
        let publication = (CONFIG.get('cms') || {}).publication || {};
        let target = publication.target || {};
        if (publication.runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SOURCE_ROLE_INVALID', 'CMS publication transport is available only on a Staged runtime');
        }
        if (!target.moduleName || !target.connectionName || target.connectionName === 'default') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_UNAVAILABLE', 'A distinct Online CMS target module connection is required');
        }
        let internalToken = NODICS.getInternalAuthToken(request.tenant);
        if (!internalToken) {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_INTERNAL_AUTH_UNAVAILABLE', 'CMS publication internal authentication is unavailable');
        }
        let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: target.moduleName,
            connectionName: target.connectionName, connectionType: target.connectionType || 'abstract', nodeId: target.nodeId, methodName: 'POST',
            apiName: '/publication/target/' + operation, requestBody: Object.assign({ tenant: request.tenant,
                correlationId: request.correlationId || request.requestId }, payload),
            timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts, idempotencyKey: payload.manifest && payload.manifest.code || payload.manifestCode,
            header: { Authorization: 'Bearer ' + internalToken } });
        return SERVICE.DefaultModuleService.fetch(descriptor).then(response => response && response.result);
    },
    /** Deploys one immutable release package. */
    deploy: function (payload, request) { return this.send('deploy', payload, request); },
    /** Reads target Online status for one release scope. */
    getStatus: function (payload, request) { return this.send('status', payload, request); },
    /** Rolls the Online target back to a previously deployed release. */
    rollback: function (payload, request) { return this.send('rollback', payload, request); }
};
