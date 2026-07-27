/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module import/controller/contentPack/DefaultContentPackController
 * @description Handles secured content-pack status and import requests.
 * @layer controller
 * @owner import
 */
module.exports = {
    /** Initializes the content-pack controller. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes content-pack controller initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns configured content-pack installation status. */
    getStatus: function (request, callback) {
        let promise = FACADE.DefaultContentPackFacade.getStatus(request);
        if (!callback) return promise;
        promise.then(success => callback(null, success)).catch(error => callback(error));
    },
    /** Starts a governed content-pack import. */
    importPack: function (request, callback) {
        let promise = FACADE.DefaultContentPackFacade.importPack(request);
        if (!callback) return promise;
        promise.then(success => callback(null, success)).catch(error => callback(error));
    }
};
