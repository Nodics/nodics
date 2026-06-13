/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module router/service/handlers/response/DefaultTextResponseHandlerService
 * @description Text response handler for routes that return plain text or already
 * formatted textual payloads.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this handler through router configuration to
 * customize content type, status handling, or text serialization.
 */
module.exports = {

    /**
     * Initializes the text response handler during service loading.
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
     * Finalizes the text response handler after service loading.
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
     * Sends a plain text response.
     *
     * @param {Object} request Express request.
     * @param {Object} response Express response.
     * @param {string|Buffer|Object} success Successful pipeline result.
     * @returns {void}
     * @sideEffects Writes HTTP response body using Express `send`.
     */
    handleSuccess: function (request, response, success) {
        response.send(success);
    },

    /**
     * Sends text route errors as JSON.
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
