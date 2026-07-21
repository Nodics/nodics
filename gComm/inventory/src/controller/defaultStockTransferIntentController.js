/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/controller/DefaultStockTransferIntentController @description Maps transfer commands to their facade. @layer controller @owner inventory */
module.exports = { /** Initializes controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Dispatches operation. */ run: function (operation, request, callback) { let promise = FACADE.DefaultStockTransferIntentFacade[operation](request); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; },
    /** Handles create. */ create: function (r, c) { return module.exports.run('create', r, c); }, /** Handles dispatch. */ dispatch: function (r, c) { return module.exports.run('dispatch', r, c); },
    /** Handles receive. */ receive: function (r, c) { return module.exports.run('receive', r, c); }, /** Handles cancel. */ cancel: function (r, c) { return module.exports.run('cancel', r, c); },
    /** Handles discrepancy. */ discrepancy: function (r, c) { return module.exports.run('discrepancy', r, c); }, /** Handles reconcile. */ reconcile: function (r, c) { return module.exports.run('reconcile', r, c); },
    /** Handles return. */ returnTransfer: function (r, c) { return module.exports.run('returnTransfer', r, c); } };
