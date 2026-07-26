/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module import/facade/contentPack/DefaultContentPackFacade
 * @description Exposes governed content-pack status and import operations.
 * @layer facade
 * @owner import
 * @override Later modules may replace the facade while preserving nImport as
 * execution authority.
 */
module.exports = {
    init: function () {
        return Promise.resolve(true);
    },
    postInit: function () {
        return Promise.resolve(true);
    },
    getStatus: function (request) {
        return SERVICE.DefaultContentPackService.getStatus(request);
    },
    importPack: function (request) {
        return SERVICE.DefaultContentPackService.importPack(request);
    }
};
