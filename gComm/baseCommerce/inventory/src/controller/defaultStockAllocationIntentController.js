/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/controller/DefaultStockAllocationIntentController @description Maps internal allocation commands to their facade. @layer controller @owner inventory */
module.exports = {
    /** Initializes controller. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Dispatches promise or callback invocation. */ dispatch: function (promise, callback) { return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; },
    /** Handles allocate. */ allocate: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockAllocationIntentFacade.allocate(request), callback); },
    /** Handles cancel. */ cancel: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockAllocationIntentFacade.cancel(request), callback); },
    /** Handles release. */ release: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockAllocationIntentFacade.release(request), callback); },
    /** Handles fulfill. */ fulfill: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockAllocationIntentFacade.fulfill(request), callback); }
};
