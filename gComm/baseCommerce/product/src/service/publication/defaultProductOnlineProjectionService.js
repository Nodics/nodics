/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/service/publication/DefaultProductOnlineProjectionService @description Bridges successful Online activation and rollback to durable Product cache/search projection jobs. @layer service @owner product */
module.exports = {
    /** Initializes Online projection hooks. */ init: function () { return Promise.resolve(true); },
    /** Completes hook initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Runs after successful Online activation without rolling back authoritative activation on projection failure. */ afterActivate: function (publication, activation, request) { if ((((CONFIG.get('product') || {}).publication || {}).runtimeRole) !== 'ONLINE') return Promise.resolve(true); return SERVICE.DefaultProductProjectionOrchestrationService.afterActivation('ACTIVATE', activation.version, request); },
    /** Runs after successful Online rollback through the same durable projection path. */ afterRollback: function (publication, activation, request) { if ((((CONFIG.get('product') || {}).publication || {}).runtimeRole) !== 'ONLINE') return Promise.resolve(true); return SERVICE.DefaultProductProjectionOrchestrationService.afterActivation('ROLLBACK', activation.version, request); }
};
