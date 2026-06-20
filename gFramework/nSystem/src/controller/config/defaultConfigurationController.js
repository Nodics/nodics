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
        let body = request.httpRequest.body || {};
        request.config = body.configuration || body;
        request.requestReason = body.requestReason || request.requestReason;
        if (callback) {
            FACADE.DefaultConfigurationFacade.changeConfig(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.changeConfig(request);
        }
    },

    /**
     * Restores a runtime configuration from activation history.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper.
     * @param {Object} request.httpRequest.body Rollback payload with activationCode.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    rollbackRuntimeConfiguration: function (request, callback) {
        let body = request.httpRequest && request.httpRequest.body ? request.httpRequest.body : {};
        request.activationCode = body.activationCode || request.activationCode;
        if (callback) {
            FACADE.DefaultConfigurationFacade.rollbackRuntimeConfiguration(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.rollbackRuntimeConfiguration(request);
        }
    },

    /**
     * Returns runtime configuration activation history.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    getRuntimeConfigurationHistory: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.getRuntimeConfigurationHistory(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.getRuntimeConfigurationHistory(request);
        }
    },

    /**
     * Returns runtime configuration governance summary for admin dashboards.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    getRuntimeConfigurationGovernanceSummary: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.getRuntimeConfigurationGovernanceSummary(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.getRuntimeConfigurationGovernanceSummary(request);
        }
    },

    /**
     * Returns a non-destructive runtime governance cleanup preview.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    previewRuntimeConfigurationGovernanceCleanup: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.previewRuntimeConfigurationGovernanceCleanup(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.previewRuntimeConfigurationGovernanceCleanup(request);
        }
    },

    /**
     * Applies runtime governance cleanup when explicitly confirmed.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    cleanupRuntimeConfigurationGovernance: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.cleanupRuntimeConfigurationGovernance(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.cleanupRuntimeConfigurationGovernance(request);
        }
    },

    /**
     * Returns a non-destructive runtime configuration activation preview.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    previewRuntimeConfiguration: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.previewRuntimeConfiguration(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.previewRuntimeConfiguration(request);
        }
    },

    /**
     * Creates a runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    createRuntimeConfigurationActivationRequest: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.createRuntimeConfigurationActivationRequest(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.createRuntimeConfigurationActivationRequest(request);
        }
    },

    /**
     * Returns runtime configuration activation requests for admin work queues.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    getRuntimeConfigurationActivationRequests: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.getRuntimeConfigurationActivationRequests(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.getRuntimeConfigurationActivationRequests(request);
        }
    },

    /**
     * Approves a runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    approveRuntimeConfigurationActivationRequest: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.approveRuntimeConfigurationActivationRequest(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.approveRuntimeConfigurationActivationRequest(request);
        }
    },

    /**
     * Rejects a runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    rejectRuntimeConfigurationActivationRequest: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.rejectRuntimeConfigurationActivationRequest(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.rejectRuntimeConfigurationActivationRequest(request);
        }
    },

    /**
     * Activates an approved runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @param {Function} [callback] Optional Node-style callback used by controller pipeline execution.
     * @returns {Promise|undefined} Returns a promise when no callback is supplied.
     */
    activateRuntimeConfigurationActivationRequest: function (request, callback) {
        if (callback) {
            FACADE.DefaultConfigurationFacade.activateRuntimeConfigurationActivationRequest(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultConfigurationFacade.activateRuntimeConfigurationActivationRequest(request);
        }
    }
};
