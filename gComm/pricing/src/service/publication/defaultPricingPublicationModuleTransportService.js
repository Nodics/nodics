/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/service/publication/DefaultPricingPublicationModuleTransportService @description Authenticated transport from Staged Pricing to a distinct Online Pricing runtime. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the send Pricing contract. */
    send: function (operation, payload, request) { let publication = (CONFIG.get('pricing') || {}).publication || {}, target = publication.target || {}; if (publication.runtimeRole !== 'STAGED') throw new CLASSES.NodicsError('ERR_PRICE_00052', 'Pricing publication transport requires Staged runtime'); if (!target.moduleName || !target.connectionName || target.connectionName === 'default') throw new CLASSES.NodicsError('ERR_PRICE_00053', 'A distinct Online Pricing connection is required'); let token = NODICS.getInternalAuthToken(request.tenant); if (!token) throw new CLASSES.NodicsError('ERR_PRICE_00059', 'Pricing publication service token is unavailable'); let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: target.moduleName, connectionName: target.connectionName, connectionType: target.connectionType || 'abstract', methodName: 'POST', apiName: '/publication/target/' + operation, requestBody: Object.assign({ correlationId: request.correlationId || request.requestId }, payload), timeoutMs: target.timeoutMs, maxAttempts: target.maxAttempts, idempotencyKey: payload.manifest && payload.manifest.code || payload.manifestCode, header: { Authorization: 'Bearer ' + token } }); return SERVICE.DefaultModuleService.fetch(descriptor).then(response => response && (response.data || response.result)); },
    /** Executes the deploy Pricing contract. */
    deploy: function (payload, request) { return this.send('deploy', payload, request); },
    /** Executes the getStatus Pricing contract. */
    getStatus: function (payload, request) { return this.send('status', payload, request); },
    /** Executes the rollback Pricing contract. */
    rollback: function (payload, request) { return this.send('rollback', payload, request); }
};
