/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/controller/DefaultBackofficeRegistryController
 * @description Maps BackOffice registry HTTP operations to the registry facade with promise and callback support.
 * @layer controller
 * @owner backoffice
 * @override Later modules may replace request mapping while preserving access and response contracts.
 */
module.exports = {
    /** Initializes the registry controller. */
    init: function () { return Promise.resolve(true); },
    /** Finalizes registry controller initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes one facade operation using the standard optional callback contract. */
    execute: function (operation, request, callback) {
        let promise = FACADE.DefaultBackofficeRegistryFacade[operation](request);
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    },
    /** Handles module registration requests. */
    register: function (request, callback) { return this.execute('register', request, callback); },
    /** Handles module deregistration requests. */
    deregister: function (request, callback) { return this.execute('deregister', request, callback); },
    /** Handles client-safe registry discovery requests. */
    list: function (request, callback) { return this.execute('list', request, callback); },
    /** Handles authorized BackOffice client bootstrap requests. */
    bootstrap: function (request, callback) { return this.execute('bootstrap', request, callback); },
    /** Handles secured registry diagnostic requests. */
    diagnostics: function (request, callback) { return this.execute('diagnostics', request, callback); },
    /** Handles bounded administrative registry search. */
    adminList: function (request, callback) { return this.execute('adminList', request, callback); },
    /** Handles sanitized administrative module detail. */
    adminDetail: function (request, callback) { return this.execute('adminDetail', request, callback); },
    /** Handles an authorized module observation refresh. */
    refresh: function (request, callback) { return this.execute('refresh', request, callback); }
};
