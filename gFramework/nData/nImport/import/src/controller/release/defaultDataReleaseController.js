/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/controller/release/DefaultDataReleaseController @description Maps secured HTTP requests into bounded data-release catalogue, preflight, and execution operations. */
module.exports = {
    /** Initializes the controller. */
    init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the authorized data-release catalogue. */
    getCatalogue: function (request, callback) {
        request.dataType = request.httpRequest && request.httpRequest.query && request.httpRequest.query.dataType;
        return this.respond(FACADE.DefaultDataReleaseFacade.getCatalogue(request), callback);
    },
    /** Validates a requested immutable release plan without persistence. */
    preflight: function (request, callback) {
        request.releaseRequest = request.httpRequest && request.httpRequest.body || {};
        return this.respond(FACADE.DefaultDataReleaseFacade.preflight(request), callback);
    },
    /** Executes a governed Init release plan. */
    executeInit: function (request, callback) { return this.executeType(request, callback, 'init'); },
    /** Executes a governed Core release plan. */
    executeCore: function (request, callback) { return this.executeType(request, callback, 'core'); },
    /** Executes a governed Sample release plan. */
    executeSample: function (request, callback) { return this.executeType(request, callback, 'sample'); },
    /** Normalizes a fixed route-owned data type and delegates execution. */
    executeType: function (request, callback, dataType) {
        request.releaseRequest = Object.assign({}, request.httpRequest && request.httpRequest.body, { dataType: dataType });
        return this.respond(FACADE.DefaultDataReleaseFacade.execute(request), callback);
    },
    /** Bridges a promise to the optional Nodics callback contract. */
    respond: function (promise, callback) {
        if (!callback) return promise;
        promise.then(success => callback(null, success)).catch(error => callback(error));
    }
};
