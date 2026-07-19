/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module system/controller/DefaultHealthController
 * @description Controller for production liveness and readiness probes owned by
 * the nSystem operational contract.
 * @layer controller
 * @owner system
 * @override Project modules may override this controller in later active modules
 * to add project-specific probe policy while preserving low-disclosure liveness
 * and secured readiness semantics.
 */
module.exports = {

    /**
     * Initializes the health controller during entity loading.
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
     * Finalizes the health controller after entity loading.
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
     * Returns the low-disclosure liveness response for process-alive probes.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    getLiveness: function (request, callback) {
        if (callback) {
            FACADE.DefaultHealthFacade.getLiveness(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultHealthFacade.getLiveness(request);
        }
    },

    /**
     * Returns the public low-disclosure readiness response for traffic probes.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    getReadiness: function (request, callback) {
        if (callback) {
            FACADE.DefaultHealthFacade.getReadiness(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultHealthFacade.getReadiness(request);
        }
    },

    /** Returns secured sanitized readiness details for operations users. */
    getReadinessDetails: function (request, callback) {
        if (callback) {
            FACADE.DefaultHealthFacade.getReadinessDetails(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultHealthFacade.getReadinessDetails(request);
        }
    }
};
