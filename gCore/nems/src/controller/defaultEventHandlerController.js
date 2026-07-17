/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nems/controller/DefaultEventHandlerController
 * @description Adapts secured event processing and reset API requests into NEMS facade calls.
 * @layer controller
 * @owner nems
 * @override Project modules may override this controller to add governed event-processing endpoints.
 */
module.exports = {

    /**
     * Processes pending asynchronous events for the active request context.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    processEvents: function (request, callback) {
        if (callback) {
            FACADE.DefaultEventHandlerFacade.processEvents(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEventHandlerFacade.processEvents(request);
        }
    },

    /**
     * Resets stale processing events back to NEW using request body criteria or the default timeout query.
     *
     * @param {Object} request Nodics request context containing optional body query/model data.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise<Object>|void} Promise when no callback is supplied.
     */
    resetEvents: function (request, callback) {
        if (!UTILS.isBlank(request.httpRequest.body)) {
            request = _.merge(request, request.httpRequest.body || {});
        }
        request.body = request.httpRequest.body || {};
        if (callback) {
            FACADE.DefaultEventHandlerFacade.resetEvents(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultEventHandlerFacade.resetEvents(request);
        }
    }
};
