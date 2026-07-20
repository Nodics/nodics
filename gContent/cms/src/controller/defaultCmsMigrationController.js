/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/controller/defaultCmsMigrationController
 * @description Maps permissioned CMS migration requests to the layered migration service.
 * @layer controller
 * @owner cms
 * @override Later modules may replace request mapping while preserving preview/apply/rollback semantics.
 */
module.exports = {
    /** Invokes one CMS migration operation with normalized request input. */
    invoke: function (operation, request, callback) {
        request.cmsMigration = request.httpRequest && request.httpRequest.body || request.cmsMigration || {};
        let promise = SERVICE.DefaultCmsMigrationService[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, { code: 'SUC_SYS_00000', result: result })).catch(callback);
    },
    /** Returns a non-mutating migration preview. */
    previewMigration: function (request, callback) { return this.invoke('previewMigration', request, callback); },
    /** Applies the current versioned migration change set. */
    applyMigration: function (request, callback) { return this.invoke('applyMigration', request, callback); },
    /** Restores the audited pre-migration values. */
    rollbackMigration: function (request, callback) { return this.invoke('rollbackMigration', request, callback); }
};
