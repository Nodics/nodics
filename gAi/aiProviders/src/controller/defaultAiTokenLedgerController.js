/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/controller/defaultAiTokenLedgerController
 * @description Maps authorized ledger administration and internal recovery routes to their service owner.
 * @layer controller
 * @owner aiProviders
 */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Preserves the Nodics callback response contract. */
    invoke: function (operation, request, callback) {
        let promise = Promise.resolve(SERVICE.DefaultAiTokenLedgerOperationsService[operation](request))
            .then(data => ({ code: 'SUC_SYS_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Lists effective budgets. */ budgets: function (request, callback) { return this.invoke('budgets', request, callback); },
    /** Lists reservations. */ reservations: function (request, callback) { return this.invoke('reservations', request, callback); },
    /** Lists usage evidence. */ usage: function (request, callback) { return this.invoke('usage', request, callback); },
    /** Returns a client-safe summary for the authenticated employee. */
    ownSummary: function (request, callback) { return this.invoke('ownSummary', request, callback); },
    /** Lists repair runs. */ repairRuns: function (request, callback) { return this.invoke('repairRuns', request, callback); },
    /** Lists repair findings. */ repairFindings: function (request, callback) { return this.invoke('repairFindings', request, callback); },
    /** Updates one budget ceiling. */ updateBudget: function (request, callback) { return this.invoke('updateBudget', request, callback); },
    /** Expires bounded stale reservations. */ expire: function (request, callback) { return this.invoke('expire', request, callback); },
    /** Runs a bounded repair scan. */ repairScan: function (request, callback) { return this.invoke('repairScan', request, callback); },
    /** Reconciles uncertain provider usage. */ reconcileUncertain: function (request, callback) { return this.invoke('reconcileUncertain', request, callback); },
    /** Approves deterministic repair. */ approveRepairFinding: function (request, callback) { return this.invoke('approveRepairFinding', request, callback); },
    /** Applies approved deterministic repair. */ applyRepairFinding: function (request, callback) { return this.invoke('applyRepairFinding', request, callback); },
    /** Returns sanitized repair metrics. */ metrics: function (request, callback) { return this.invoke('metrics', request, callback); }
};
