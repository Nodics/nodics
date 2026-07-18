/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module system/facade/DefaultHealthFacade
 * @description Facade for system health operations. It keeps route/controller
 * execution separate from runtime health evaluation.
 * @layer facade
 * @owner system
 * @override Project modules may override this facade to enrich or delegate
 * readiness checks while preserving the health response contract.
 */
module.exports = {

    /**
     * Initializes the health facade during entity loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when facade initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the health facade after entity loading.
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
     * Returns the low-disclosure liveness response.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a Nodics response envelope.
     */
    getLiveness: function (request) {
        return SERVICE.DefaultHealthService.getLiveness(request);
    },

    /**
     * Returns the secured readiness response.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Promise resolving to a Nodics response envelope.
     */
    getReadiness: function (request) {
        return SERVICE.DefaultHealthService.getReadiness(request);
    }
};
