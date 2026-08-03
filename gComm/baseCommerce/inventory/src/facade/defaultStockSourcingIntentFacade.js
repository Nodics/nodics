/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/facade/DefaultStockSourcingIntentFacade @description Delegates internal Stock Sourcing intents to Inventory authority. @layer facade @owner inventory */
module.exports = {
    /** Initializes the facade. */ init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Evaluates one bounded Stock Sourcing intent. */ evaluate: function (request) { return SERVICE.DefaultStockSourcingIntentService.evaluate(request); }
};
