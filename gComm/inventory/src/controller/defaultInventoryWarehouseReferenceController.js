/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/controller/DefaultInventoryWarehouseReferenceController @description Maps the internal Warehouse reference route to its facade. @layer controller @owner inventory */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Handles one Warehouse reference lookup with optional callback compatibility. */
    resolve: function (request, callback) {
        let promise = FACADE.DefaultInventoryWarehouseReferenceFacade.resolve(request);
        if (callback) return promise.then(result => callback(null, result)).catch(callback);
        return promise;
    }
};
