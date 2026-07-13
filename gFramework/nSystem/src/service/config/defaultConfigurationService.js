/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSystem/src/service/config/defaultConfigurationService
 * @description Implements nSystem default configuration service business behavior and extension logic.
 * @layer service
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
        return new Promise((resolve, reject) => {
            try {
                if (UTILS.isBlank(request.config)) {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Configuration payload can not be null or empty'));
                    return;
                }
                if (!SERVICE.DefaultRuntimeConfigurationActivationRequestService ||
                    typeof SERVICE.DefaultRuntimeConfigurationActivationRequestService.createActivationRequest !== 'function') {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration activation request service is required'));
                    return;
                }
                let governedRequest = Object.assign({}, request, {
                    httpRequest: undefined,
                    activationRequest: {
                        configurationType: 'propertyConfiguration',
                        configurationCode: 'tenantProperties',
                        moduleName: 'system',
                        configuration: request.config,
                        requestReason: request.requestReason
                    }
                });
                SERVICE.DefaultRuntimeConfigurationActivationRequestService.createActivationRequest(governedRequest).then(resolve).catch(reject);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'While changing runtime configuration', 'ERR_SYS_00000'));
            }
        });
    },

    /**
     * Applies an integrity-checked, approved tenant-property patch and records
     * its minimal rollback snapshots through the shared runtime audit service.
     *
     * @param {Object} request Approved runtime activation context.
     * @param {Object} configuration Tenant property patch.
     * @param {Object} preview Approved preview captured with the request.
     * @returns {Promise<Object>} Activation response.
     */
    applyPropertyConfiguration: function (request, configuration, preview) {
        return new Promise((resolve, reject) => {
            let tenant = request.tenant || CONFIG.get('defaultTenant') || 'default';
            let previewService = SERVICE.DefaultRuntimeConfigurationPreviewService;
            try {
                if (!previewService || typeof previewService.createPropertyPreview !== 'function') {
                    throw new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime property preview service is required');
                }
                let currentPreview = previewService.createPropertyPreview({
                    configurationType: 'propertyConfiguration',
                    configurationCode: 'tenantProperties',
                    moduleName: 'system',
                    tenant: tenant,
                    configuration: configuration
                });
                if (preview && !_.isEqual(preview.nextSnapshot, currentPreview.nextSnapshot)) {
                    throw new CLASSES.NodicsError('ERR_SYS_00002', 'Effective tenant properties changed after approval; create a new activation request');
                }
                CONFIG.changeTenantProperties(configuration, tenant);
                let entry = {
                    configurationType: 'propertyConfiguration',
                    configurationCode: 'tenantProperties',
                    moduleName: 'system',
                    action: 'activate',
                    status: 'SUCCESS',
                    tenant: tenant,
                    requestedBy: this.resolveRuntimeActor(request),
                    approvalStatus: 'APPROVED',
                    approvedBy: request.activationApproval && request.activationApproval.approvedBy,
                    approvalReason: request.activationApproval && request.activationApproval.approvalReason,
                    activationRequestCode: request.activationRequestCode,
                    correlationId: request.correlationId,
                    riskLevel: 'HIGH',
                    warnings: currentPreview.warnings,
                    previousSnapshot: currentPreview.previousSnapshot,
                    nextSnapshot: currentPreview.nextSnapshot
                };
                this.recordPropertyConfigurationAudit(entry).then(() => resolve({
                    code: 'SUC_SYS_00000',
                    message: 'Approved tenant property configuration activated successfully',
                    data: {
                        tenant: tenant,
                        changedPaths: currentPreview.changedPaths
                    }
                }));
            } catch (error) {
                this.recordPropertyConfigurationAudit({
                    configurationType: 'propertyConfiguration', configurationCode: 'tenantProperties',
                    moduleName: 'system', action: 'activate', status: 'FAILED', tenant: tenant,
                    requestedBy: this.resolveRuntimeActor(request), correlationId: request.correlationId, error: error
                }).then(() => reject(error));
            }
        });
    },

    /**
     * Restores a minimal property snapshot captured by activation audit.
     *
     * @param {Object} request Rollback request context.
     * @param {Object} snapshot Snapshot with values and missing paths.
     * @returns {Promise<Object>} Rollback application result.
     */
    restorePropertyConfigurationSnapshot: function (request, snapshot) {
        let tenant = request.tenant || CONFIG.get('defaultTenant') || 'default';
        let properties = _.cloneDeep(CONFIG.getProperties(tenant) || {});
        (snapshot.values || []).forEach(entry => _.set(properties, entry.path, _.cloneDeep(entry.value)));
        (snapshot.missingPaths || []).forEach(path => _.unset(properties, path));
        CONFIG.setProperties(properties, tenant);
        return Promise.resolve({ tenant: tenant, restored: true });
    },

    /**

     * Executes record property configuration audit behavior.

     *

     * @param {*} entry Method input.

     * @returns {*} Method result.

     */

    recordPropertyConfigurationAudit: function (entry) {
        let service = SERVICE.DefaultRuntimeConfigurationAuditService;
        return service && typeof service.recordActivation === 'function' ? service.recordActivation(entry) : Promise.resolve(true);
    },

    /**

     * Retrieves runtime actor information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    resolveRuntimeActor: function (request) {
        let authData = request && (request.authData || request.autData) || {};
        return authData.loginId || authData.serviceId || authData.sub || authData.code || authData.userId || authData.uid || authData.email;
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

    /**

     * Processes configuration change event behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

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
