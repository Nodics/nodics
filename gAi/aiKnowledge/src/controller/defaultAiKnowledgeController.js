/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/controller/DefaultAiKnowledgeController
 * @description Normalizes secured HTTP requests and delegates to the Knowledge facade.
 * @layer controller
 * @owner aiKnowledge
 */
module.exports = {
    /** Initializes the controller. */
    init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Normalizes HTTP input and invokes one facade operation. */
    invoke: function (operation, request, callback) {
        const http = request.httpRequest || {};
        request.body = http.body || request.body || {};
        request.query = http.query || request.query || {};
        request.idempotencyKey = request.body.runCode ||
            (typeof http.get === 'function' && http.get('Idempotency-Key')) ||
            request.idempotencyKey;
        const promise = FACADE.DefaultAiKnowledgeFacade[operation](request);
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Handles candidate ingestion. */
    ingest: function (request, callback) { return this.invoke('ingest', request, callback); },
    /** Handles active-version retrieval. */
    retrieve: function (request, callback) { return this.invoke('retrieve', request, callback); },
    /** Handles candidate activation. */
    activate: function (request, callback) { return this.invoke('activate', request, callback); },
    /** Handles corpus rollback. */
    rollback: function (request, callback) { return this.invoke('rollback', request, callback); },
    /** Handles readiness diagnostics. */
    readiness: function (request, callback) { return this.invoke('readiness', request, callback); },
    /** Handles ingestion-run listing. */
    listRuns: function (request, callback) { return this.invoke('listRuns', request, callback); },
    /** Handles bounded durable metrics. */
    metrics: function (request, callback) { return this.invoke('metrics', request, callback); }
};
