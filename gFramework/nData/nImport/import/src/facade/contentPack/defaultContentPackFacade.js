/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
    /** Initializes the content-pack facade. */
    init: function () {
        return Promise.resolve(true);
    },
    /** Completes content-pack facade initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Delegates content-pack status retrieval. */
    getStatus: function (request) {
        return SERVICE.DefaultContentPackService.getStatus(request);
    },
    /** Delegates content-pack import execution. */
    importPack: function (request) {
        return SERVICE.DefaultContentPackService.importPack(request);
    }
};
