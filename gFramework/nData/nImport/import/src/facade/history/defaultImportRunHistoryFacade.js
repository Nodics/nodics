/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
