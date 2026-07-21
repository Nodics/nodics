/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/facade/DefaultStockSourcingIntentFacade @description Delegates internal Stock Sourcing intents to Inventory authority. @layer facade @owner inventory */
module.exports = {
    /** Initializes the facade. */ init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Evaluates one bounded Stock Sourcing intent. */ evaluate: function (request) { return SERVICE.DefaultStockSourcingIntentService.evaluate(request); }
};
