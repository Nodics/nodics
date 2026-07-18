/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module router/service/handlers/response/DefaultJsonResponseHandlerService
 * @description Default JSON response handler for Nodics APIs. It normalizes success
 * payloads with status metadata and converts errors to standard Nodics error JSON.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this handler through router configuration to
 * customize response envelopes, headers, tracing, masking, or API version behavior.
 *
 * @property {Object} CLASSES.NodicsError Standard error wrapper used for unknown failures.
 * @property {Object} SERVICE.DefaultStatusService Resolves response code and message by status code.
 */
module.exports = {

    /**
     * Initializes the JSON response handler during service loading.
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
     * Finalizes the JSON response handler after service loading.
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
     * Sends a normalized JSON success response.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Object} success Successful pipeline result.
     * @returns {void}
     * @sideEffects Writes HTTP status and JSON body.
     * @throws Delegates formatting failures to `handleError`.
     */
    handleSuccess: function (request, response, success) {
        try {
            if (success && success.metadata && success.metadata.rawResponse === true) {
                if (success.metadata.contentType && response.type) {
                    response.type(success.metadata.contentType);
                }
                response.status(success.responseCode || 200);
                response.json(success.data);
                return;
            }
            success.code = success.code || 'SUC_SYS_00000';
            success.responseCode = success.responseCode || SERVICE.DefaultStatusService.get(success.code).code;
            success.message = success.message || SERVICE.DefaultStatusService.get(success.code).message;
            response.status(success.responseCode);
            response.json(success);
        } catch (error) {
            this.handleError(request, response, error);
        }

    },

    /**
     * Sends a normalized Nodics JSON error response.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {Error|Object} error Error produced by pipeline execution.
     * @returns {void}
     * @sideEffects Wraps non-Nodics errors, logs, and writes HTTP status plus JSON error body.
     */
    handleError: function (request, response, error) {
        if (!(error instanceof CLASSES.NodicsError)) {
            error = new CLASSES.NodicsError(error);
        }
        this.LOG.error(error);
        response.status(error.responseCode);
        response.json(error.toJson());
    }
};
