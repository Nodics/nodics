/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSystem/src/facade/config/defaultConfigurationFacade
 * @description Coordinates facade-level delegation for nSystem default configuration facade operations.
 * @layer facade
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Executes change config behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    changeConfig: function (request) {
        return SERVICE.DefaultConfigurationService.changeConfig(request);
    },

    /**
     * Delegates runtime configuration rollback to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Rollback response.
     */
    rollbackRuntimeConfiguration: function (request) {
        return SERVICE.DefaultConfigurationService.rollbackRuntimeConfiguration(request);
    },

    /**
     * Delegates runtime configuration activation history lookup to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation history response.
     */
    getRuntimeConfigurationHistory: function (request) {
        return SERVICE.DefaultConfigurationService.getRuntimeConfigurationHistory(request);
    },

    /**
     * Delegates runtime configuration governance summary lookup to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Runtime governance summary response.
     */
    getRuntimeConfigurationGovernanceSummary: function (request) {
        return SERVICE.DefaultConfigurationService.getRuntimeConfigurationGovernanceSummary(request);
    },

    /**
     * Delegates runtime governance cleanup preview to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cleanup preview response.
     */
    previewRuntimeConfigurationGovernanceCleanup: function (request) {
        return SERVICE.DefaultConfigurationService.previewRuntimeConfigurationGovernanceCleanup(request);
    },

    /**
     * Delegates runtime governance cleanup to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cleanup response.
     */
    cleanupRuntimeConfigurationGovernance: function (request) {
        return SERVICE.DefaultConfigurationService.cleanupRuntimeConfigurationGovernance(request);
    },

    /**
     * Delegates runtime configuration preview to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation preview response.
     */
    previewRuntimeConfiguration: function (request) {
        return SERVICE.DefaultConfigurationService.previewRuntimeConfiguration(request);
    },

    /**
     * Delegates activation request creation to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request response.
     */
    createRuntimeConfigurationActivationRequest: function (request) {
        return SERVICE.DefaultConfigurationService.createRuntimeConfigurationActivationRequest(request);
    },

    /**
     * Delegates activation request lookup to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request query response.
     */
    getRuntimeConfigurationActivationRequests: function (request) {
        return SERVICE.DefaultConfigurationService.getRuntimeConfigurationActivationRequests(request);
    },

    /**
     * Delegates activation request approval to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Approval response.
     */
    approveRuntimeConfigurationActivationRequest: function (request) {
        return SERVICE.DefaultConfigurationService.approveRuntimeConfigurationActivationRequest(request);
    },

    /**
     * Delegates activation request rejection to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Rejection response.
     */
    rejectRuntimeConfigurationActivationRequest: function (request) {
        return SERVICE.DefaultConfigurationService.rejectRuntimeConfigurationActivationRequest(request);
    },

    /**
     * Delegates approved activation request execution to the system service.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation response.
     */
    activateRuntimeConfigurationActivationRequest: function (request) {
        return SERVICE.DefaultConfigurationService.activateRuntimeConfigurationActivationRequest(request);
    }
};
