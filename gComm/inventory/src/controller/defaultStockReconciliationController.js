/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/controller/DefaultStockReconciliationController @description Maps reconciliation commands while preserving human approval and service execution separation. @layer controller @owner inventory */
module.exports = { /** Initializes controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Dispatches an operation. */ run: function (operation, request, callback) { let promise = SERVICE.DefaultStockReconciliationService[operation](Object.assign({}, request, { reconciliation: request.body || {} })); return callback ? promise.then(value => callback(null, { code: 'SUC_INV_00007', data: value })).catch(callback) : promise.then(value => ({ code: 'SUC_INV_00007', data: value })); },
    /** Runs scan. */ scan: function (r, c) { return module.exports.run('scan', r, c); }, /** Approves finding. */ approve: function (r, c) { return module.exports.run('approve', r, c); }, /** Repairs finding. */ repair: function (r, c) { return module.exports.run('repair', r, c); } };
