/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/service/publication/DefaultProductPublicationModuleTransportService @description Uses internal module authentication to deliver Product manifests from Staged to a distinct Online runtime. @layer service @owner product */
module.exports = {
    /** Initializes publication transport. */ init: function () { return Promise.resolve(true); },
    /** Completes transport initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Sends one authenticated bounded target operation. */ send: function (operation, payload, request) { let publication = (CONFIG.get('product') || {}).publication || {}, target = publication.target || {}; if (publication.runtimeRole !== 'STAGED') throw new CLASSES.NodicsError('ERR_PRODUCT_00042', 'Product publication transport requires Staged runtime'); if (!target.moduleName || !target.connectionName || target.connectionName === 'default') throw new CLASSES.NodicsError('ERR_PRODUCT_00043', 'A distinct Online Product connection is required'); let token = NODICS.getInternalAuthToken(request.tenant); if (!token) throw new CLASSES.NodicsError('ERR_PRODUCT_00049', 'Product publication service token is unavailable'); let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: target.moduleName, connectionName: target.connectionName, connectionType: target.connectionType || 'abstract', methodName: 'POST', apiName: '/publication/target/' + operation, requestBody: Object.assign({ correlationId: request.correlationId || request.requestId }, payload), timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts, idempotencyKey: payload.manifest && payload.manifest.code || payload.manifestCode, header: { Authorization: 'Bearer ' + token } }); return SERVICE.DefaultModuleService.fetch(descriptor).then(response => response && (response.data || response.result)); },
    /** Deploys a Product manifest. */ deploy: function (payload, request) { return this.send('deploy', payload, request); },
    /** Reads Product target status. */ getStatus: function (payload, request) { return this.send('status', payload, request); },
    /** Rolls Product back. */ rollback: function (payload, request) { return this.send('rollback', payload, request); }
};
