/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    changeConfig: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (UTILS.isBlank(request.config)) {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration payload can not be null or empty'));
                } else {
                    CONFIG.changeTenantProperties(request.config, request.tenant);
                    resolve({
                        code: 'SUC_SYS_00000',
                        message: 'Configuration updated successfully'
                    });
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While changing runtime configuration', 'ERR_SYS_00000'));
            }
        });
    },

    /**
     * Rolls back a runtime schema/router configuration from activation history.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Rollback response.
     */
    rollbackRuntimeConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (!SERVICE.DefaultRuntimeConfigurationRollbackService ||
                    typeof SERVICE.DefaultRuntimeConfigurationRollbackService.rollbackActivation !== 'function') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration rollback service is not available'));
                    return;
                }
                SERVICE.DefaultRuntimeConfigurationRollbackService.rollbackActivation(request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While rolling back runtime configuration', 'ERR_SYS_00000'));
            }
        });
    },

    /**
     * Returns runtime configuration activation history.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation history response.
     */
    getRuntimeConfigurationHistory: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (!SERVICE.DefaultRuntimeConfigurationAuditService ||
                    typeof SERVICE.DefaultRuntimeConfigurationAuditService.getActivationHistory !== 'function') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration audit service is not available'));
                    return;
                }
                SERVICE.DefaultRuntimeConfigurationAuditService.getActivationHistory(request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While fetching runtime configuration history', 'ERR_SYS_00000'));
            }
        });
    },

    /**
     * Returns runtime configuration governance summary for the admin control plane.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Runtime governance summary response.
     */
    getRuntimeConfigurationGovernanceSummary: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (!SERVICE.DefaultRuntimeConfigurationGovernanceSummaryService ||
                    typeof SERVICE.DefaultRuntimeConfigurationGovernanceSummaryService.getGovernanceSummary !== 'function') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration governance summary service is not available'));
                    return;
                }
                SERVICE.DefaultRuntimeConfigurationGovernanceSummaryService.getGovernanceSummary(request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While fetching runtime configuration governance summary', 'ERR_SYS_00000'));
            }
        });
    },

    /**
     * Returns a non-destructive runtime governance cleanup preview.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cleanup preview response.
     */
    previewRuntimeConfigurationGovernanceCleanup: function (request) {
        return this.delegateRuntimeConfigurationGovernanceCleanup(request, 'previewCleanup');
    },

    /**
     * Applies runtime governance cleanup when explicitly confirmed.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cleanup response.
     */
    cleanupRuntimeConfigurationGovernance: function (request) {
        return this.delegateRuntimeConfigurationGovernanceCleanup(request, 'cleanup');
    },

    /**
     * Returns a non-destructive preview of runtime schema/router activation.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation preview response.
     */
    previewRuntimeConfiguration: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (!SERVICE.DefaultRuntimeConfigurationPreviewService ||
                    typeof SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation !== 'function') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration preview service is not available'));
                    return;
                }
                SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation(request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While previewing runtime configuration', 'ERR_SYS_00000'));
            }
        });
    },

    /**
     * Creates a runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request response.
     */
    createRuntimeConfigurationActivationRequest: function (request) {
        return this.delegateRuntimeConfigurationActivationRequest(request, 'createActivationRequest');
    },

    /**
     * Returns runtime configuration activation requests.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation request query response.
     */
    getRuntimeConfigurationActivationRequests: function (request) {
        return this.delegateRuntimeConfigurationActivationRequest(request, 'getActivationRequests');
    },

    /**
     * Approves a runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Approval response.
     */
    approveRuntimeConfigurationActivationRequest: function (request) {
        return this.delegateRuntimeConfigurationActivationRequest(request, 'approveActivationRequest');
    },

    /**
     * Rejects a runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Rejection response.
     */
    rejectRuntimeConfigurationActivationRequest: function (request) {
        return this.delegateRuntimeConfigurationActivationRequest(request, 'rejectActivationRequest');
    },

    /**
     * Activates an approved runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Activation response.
     */
    activateRuntimeConfigurationActivationRequest: function (request) {
        return this.delegateRuntimeConfigurationActivationRequest(request, 'activateApprovedRequest');
    },

    /**
     * Delegates activation request lifecycle operations to dynamo governance service.
     *
     * @param {Object} request Nodics request context.
     * @param {string} operation Runtime activation request service operation.
     * @returns {Promise<Object>} Operation response.
     */
    delegateRuntimeConfigurationActivationRequest: function (request, operation) {
        return new Promise((resolve, reject) => {
            try {
                if (!SERVICE.DefaultRuntimeConfigurationActivationRequestService ||
                    typeof SERVICE.DefaultRuntimeConfigurationActivationRequestService[operation] !== 'function') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration activation request service is not available'));
                    return;
                }
                SERVICE.DefaultRuntimeConfigurationActivationRequestService[operation](request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While processing runtime configuration activation request', 'ERR_SYS_00000'));
            }
        });
    },

    /**
     * Delegates runtime governance cleanup operations to the dynamo cleanup service.
     *
     * @param {Object} request Nodics request context.
     * @param {string} operation Runtime governance cleanup operation.
     * @returns {Promise<Object>} Operation response.
     */
    delegateRuntimeConfigurationGovernanceCleanup: function (request, operation) {
        return new Promise((resolve, reject) => {
            try {
                if (!SERVICE.DefaultRuntimeConfigurationGovernanceCleanupService ||
                    typeof SERVICE.DefaultRuntimeConfigurationGovernanceCleanupService[operation] !== 'function') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration governance cleanup service is not available'));
                    return;
                }
                SERVICE.DefaultRuntimeConfigurationGovernanceCleanupService[operation](request).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While processing runtime configuration governance cleanup', 'ERR_SYS_00000'));
            }
        });
    },

    handleConfigurationChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            try {
                this.get({
                    authData: request.authData,
                    tenant: request.tenant,
                    searchOptions: {
                        projection: { _id: 0 }
                    },
                    query: {
                        code: {
                            $in: request.event.data.models
                        }
                    }
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        success.result.forEach(configuration => {
                            CONFIG.changeTenantProperties(configuration.config, request.tenant);
                        });
                    }
                    resolve('Configuration update successfully');
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error));
            }
        });
    }
};
