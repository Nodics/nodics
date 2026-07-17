/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module router/service/handlers/response/DefaultFileDownloadResponseHandlerService
 * @description Response handler for routes that return downloadable files instead of
 * JSON payloads.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this handler through router configuration to
 * enforce file authorization, custom headers, streaming, or audit behavior.
 *
 * @property {Object} success.filePath Absolute or runtime-resolvable file path to download.
 */
module.exports = {

    /**
     * Initializes the file download response handler during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the file download response handler after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Sends a file download response.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} success Successful pipeline result containing file path.
     * @returns {void}
     * @sideEffects Writes a file download HTTP response.
     */
    handleSuccess: function (request, response, success) {
        response.download(success.filePath);
    },

    /**
     * Sends file download errors as JSON.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} error Error produced by pipeline execution.
     * @returns {void}
     */
    handleError: function (request, response, error) {
        response.json(error);
    }
};
