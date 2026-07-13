/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/controller/identity/DefaultIdentityGovernanceController
 * @description Maps permissioned identity migration and credential rotation HTTP requests to the layered governance service.
 * @layer controller
 * @owner profile
 * @override Later project modules may replace request mapping while preserving operation names and credential redaction.
 */
module.exports = {
    /** Invokes a governance operation with the normalized request body. */
    invoke: function (operation, request, callback) {
        request.identityMigration = request.httpRequest && request.httpRequest.body || request.identityMigration || {};
        let promise = SERVICE.DefaultIdentityGovernanceMigrationService[operation](request);
        if (callback) promise.then(result => callback(null, result)).catch(callback);
        else return promise;
    },
    /** Returns a non-mutating identity migration preview. */
    previewMigration: function (request, callback) {
        return this.invoke('previewMigration', request, callback);
    },
    /** Applies the previewed versioned identity migration. */
    applyMigration: function (request, callback) {
        return this.invoke('applyMigration', request, callback);
    },
    /** Rolls back only the audited migration change set. */
    rollbackMigration: function (request, callback) {
        return this.invoke('rollbackMigration', request, callback);
    },
    /** Replaces a service credential with a client-generated secret. */
    rotateServiceKey: function (request, callback) {
        return this.invoke('rotateServiceKey', request, callback);
    }
};
