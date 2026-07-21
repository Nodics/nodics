/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/facade/DefaultStockReservationIntentFacade @description Delegates reservation intents to Inventory. @layer facade @owner inventory */
module.exports = {
    /** Initializes the facade. */ init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Delegates reserve. */ reserve: function (request) { return SERVICE.DefaultStockReservationIntentService.reserve(request); },
    /** Delegates release. */ release: function (request) { return SERVICE.DefaultStockReservationIntentService.release(request); },
    /** Delegates cancel. */ cancel: function (request) { return SERVICE.DefaultStockReservationIntentService.cancel(request); },
    /** Delegates consume. */ consume: function (request) { return SERVICE.DefaultStockReservationIntentService.consume(request); },
    /** Delegates expiry. */ expire: function (request) { return SERVICE.DefaultStockReservationIntentService.expire(request); }
};
