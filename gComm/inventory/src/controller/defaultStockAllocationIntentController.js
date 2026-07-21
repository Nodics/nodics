/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
