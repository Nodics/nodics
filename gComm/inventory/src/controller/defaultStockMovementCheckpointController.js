/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/controller/DefaultStockMovementCheckpointController @description Maps service-token checkpoint commands to the reconciliation orchestration. @layer controller @owner inventory */
module.exports = { /** Initializes controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Dispatches checkpoint command. */ run: function (operation, request, callback) { let promise = SERVICE.DefaultStockMovementCheckpointOrchestrationService[operation](Object.assign({}, request, { checkpoint: request.body || {} })).then(data => ({ code: 'SUC_INV_00007', data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, /** Creates checkpoint. */ create: function (r, c) { return module.exports.run('create', r, c); }, /** Reconstructs Balance. */ reconstruct: function (r, c) { return module.exports.run('reconstruct', r, c); } };
