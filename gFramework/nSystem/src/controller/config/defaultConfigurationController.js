/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module system/controller/DefaultConfigurationController
 * @description Controller for runtime configuration changes in the Nodics control plane.
 * @layer controller
 * @owner system
 * @override Project modules may override this controller in a later-loaded module to govern
 * runtime configuration changes without changing Nodics core code.
 *
 * @property {Object} FACADE.DefaultConfigurationFacade Facade responsible for validating and applying configuration changes.
 * @property {Object} request.httpRequest Express request wrapper supplied by the router pipeline.
 * @property {Object} request.config Normalized runtime configuration payload added by this controller.
 */
module.exports = {

    /**
     * Initializes the configuration controller during entity loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when controller initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the configuration controller after entity loading.
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
     * Applies a runtime configuration change request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper.
     * @param {Object} request.httpRequest.body Configuration payload supplied by the caller.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     * @sideEffects Writes `request.config` and delegates persistence to `DefaultConfigurationFacade`.
     * @throws Propagates facade errors through the callback or rejected promise.
     */
    changeConfig: function (request, callback) {
        request.config = request.httpRequest.body || {};
        if (callback) {
            FACADE.DefaultConfigurationFacade.changeConfig(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.changeConfig(request);
        }
    }
};
