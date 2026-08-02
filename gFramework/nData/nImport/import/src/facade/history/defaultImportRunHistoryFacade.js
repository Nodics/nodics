/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/facade/history/DefaultImportRunHistoryFacade
 * @description Facade for import run history control-plane operations.
 * @layer facade
 * @owner import
 * @override Project modules may override this facade to apply project-specific
 * policy, masking, enrichment, or cross-service orchestration before delegating
 * to the import run history service.
 */
module.exports = {
    /**
     * Initializes the import run history facade.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the import run history facade after startup.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Returns import run history.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Import run history response.
     */
    getImportRunHistory: function (request) {
        return SERVICE.DefaultImportRunHistoryService.getImportRunHistory(request);
    },

    /**
     * Returns one import run by run id.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Import run detail response.
     */
    getImportRun: function (request) {
        return SERVICE.DefaultImportRunHistoryService.getImportRun(request);
    }
};
