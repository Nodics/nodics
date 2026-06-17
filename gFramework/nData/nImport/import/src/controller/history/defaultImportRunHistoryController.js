/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module import/controller/history/DefaultImportRunHistoryController
 * @description Controller for import run history control-plane APIs.
 * @layer controller
 * @owner import
 * @override Project modules may override this controller in a later-loaded
 * module to adjust request mapping or authorization behavior without changing
 * Nodics core import implementation.
 */
module.exports = {
    /**
     * Initializes the import run history controller.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the import run history controller after startup.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Returns import run history using filters from query string or request body.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when callback is not supplied.
     */
    getImportRunHistory: function (request, callback) {
        request.filters = this.resolveFilters(request);
        if (callback) {
            FACADE.DefaultImportRunHistoryFacade.getImportRunHistory(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultImportRunHistoryFacade.getImportRunHistory(request);
        }
    },

    /**
     * Returns one import run using the route parameter `runId`.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when callback is not supplied.
     */
    getImportRun: function (request, callback) {
        request.filters = this.resolveFilters(request);
        request.runId = request.runId || (request.httpRequest && request.httpRequest.params && request.httpRequest.params.runId);
        if (callback) {
            FACADE.DefaultImportRunHistoryFacade.getImportRun(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultImportRunHistoryFacade.getImportRun(request);
        }
    },

    /**
     * Resolves filters from body and query string without hardcoding project context.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Filter map.
     */
    resolveFilters: function (request) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        return Object.assign({}, request.filters || {}, query, body);
    }
};
