/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/controller/DefaultStockReservationIntentController @description Maps internal reservation commands to their facade. @layer controller @owner inventory */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Maps a promise result to either direct-promise or callback controller invocation. */
    dispatch: function (promise, callback) { return callback ? promise.then(result => callback(null, result)).catch(callback) : promise; },
    /** Handles reserve. */ reserve: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockReservationIntentFacade.reserve(request), callback); },
    /** Handles release. */ release: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockReservationIntentFacade.release(request), callback); },
    /** Handles cancel. */ cancel: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockReservationIntentFacade.cancel(request), callback); },
    /** Handles consume. */ consume: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockReservationIntentFacade.consume(request), callback); },
    /** Handles expiry. */ expire: function (request, callback) { return module.exports.dispatch(FACADE.DefaultStockReservationIntentFacade.expire(request), callback); }
};
