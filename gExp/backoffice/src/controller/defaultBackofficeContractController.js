/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/controller/DefaultBackofficeContractController
 * @description Maps secured BackOffice contract-history routes to their facade operations.
 * @layer controller
 * @owner backoffice
 * @override Later modules may replace request mapping while preserving action-specific permissions and response contracts.
 */
module.exports = {
    /** Initializes the controller. */
    init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes one facade operation with optional callback support. */
    execute: function (operation, request, callback) {
        let promise = Promise.resolve().then(() => FACADE.DefaultBackofficeContractFacade[operation](request));
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    },
    /** Handles active snapshot lookup. */
    current: function (request, callback) { return this.execute('current', request, callback); },
    /** Handles history lookup. */
    history: function (request, callback) { return this.execute('history', request, callback); },
    /** Handles comparison. */
    compare: function (request, callback) { return this.execute('compare', request, callback); },
    /** Handles approval. */
    approve: function (request, callback) { return this.execute('approve', request, callback); },
    /** Handles rejection. */
    reject: function (request, callback) { return this.execute('reject', request, callback); },
    /** Handles rollback. */
    rollback: function (request, callback) { return this.execute('rollback', request, callback); }
};
