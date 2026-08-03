/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/facade/DefaultStockAllocationIntentFacade @description Delegates internal Stock Allocation commands. @layer facade @owner inventory */
module.exports = {
    /** Initializes facade. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Delegates allocate. */ allocate: function (request) { return SERVICE.DefaultStockAllocationIntentService.allocate(request); },
    /** Delegates cancel. */ cancel: function (request) { return SERVICE.DefaultStockAllocationIntentService.cancel(request); },
    /** Delegates release. */ release: function (request) { return SERVICE.DefaultStockAllocationIntentService.release(request); },
    /** Delegates fulfill. */ fulfill: function (request) { return SERVICE.DefaultStockAllocationIntentService.fulfill(request); }
};
