/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/controller/lifecycle/DefaultOrderLifecycleOperationsController @description Maps permissioned lifecycle diagnostics API. @layer controller @owner order */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, diagnostics: function (request, callback) { let promise = FACADE.DefaultOrderLifecycleOperationsFacade.diagnostics(request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, notificationResult: function (request, callback) { request.notificationResult = request.httpRequest && request.httpRequest.body || request.body; let promise = FACADE.DefaultOrderLifecycleOperationsFacade.notificationResult(request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, managePolicy: function (request, callback) { request.body = request.httpRequest && request.httpRequest.body || request.body; let promise = FACADE.DefaultOrderLifecycleOperationsFacade.managePolicy(request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, manageReason: function (request, callback) { request.body = request.httpRequest && request.httpRequest.body || request.body; let promise = FACADE.DefaultOrderLifecycleOperationsFacade.manageReason(request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; } };
