/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
