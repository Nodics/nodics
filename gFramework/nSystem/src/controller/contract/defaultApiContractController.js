/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module system/controller/DefaultApiContractController
 * @description Controller for exposing generated API contracts from the active
 * server or node module context.
 * @layer controller
 * @owner system
 * @override Project modules may override this controller in a later-loaded module
 * to apply project-specific authorization, filtering, or contract response policy
 * without changing Nodics core code.
 *
 * @property {Object} FACADE.DefaultApiContractFacade Facade responsible for
 * retrieving generated API contract artifacts.
 */
module.exports = {

    /**
     * Initializes the API contract controller during entity loading.
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
     * Finalizes the API contract controller after entity loading.
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
     * Returns the generated OpenAPI contract for the active server or node.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     * @throws Propagates facade errors through the callback or rejected promise.
     */
    getOpenApiContract: function (request, callback) {
        if (callback) {
            FACADE.DefaultApiContractFacade.getOpenApiContract(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultApiContractFacade.getOpenApiContract(request);
        }
    }
};
