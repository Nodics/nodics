/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module dynamo/service/audit/DefaultRuntimeConfigurationActivationPolicyService
 * @description Applies approval governance before runtime schema and router
 * configurations are activated.
 * @layer service
 * @owner dynamo
 * @override Project modules may override this policy service to integrate
 * enterprise approval workflows, release windows, change-ticket validation, or
 * stricter risk rules without changing Nodics core activation services.
 */
module.exports = {

    /**
     * Initializes the runtime activation policy service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the runtime activation policy service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Evaluates a runtime configuration activation request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} options Policy options.
     * @returns {Promise<Object>} Policy decision.
     */
    evaluateActivation: function (request, options) {
        return new Promise((resolve, reject) => {
            if (this.isPolicyBypassed(request)) {
                resolve(this.createDecision({
                    approvalStatus: 'NOT_REQUIRED',
                    riskLevel: 'LOW',
                    approved: true,
                    reason: 'Runtime activation policy bypassed for startup or rollback replay'
                }));
                return;
            }
            this.resolvePreview(request, options).then(preview => {
                this.resolveApproval(request, options).then(approval => {
                    let destructive = preview && preview.destructive;
                    if (destructive && !approval.approved) {
                        reject(this.createPolicyError(options, preview, approval));
                        return;
                    }
                    resolve(this.createDecision({
                        approvalStatus: destructive ? 'APPROVED' : 'NOT_REQUIRED',
                        riskLevel: destructive ? 'HIGH' : 'LOW',
                        approved: true,
                        approvedBy: destructive ? approval.approvedBy : undefined,
                        approvalReason: destructive ? approval.approvalReason : undefined,
                        activationRequestCode: approval.activationRequestCode || request.activationRequestCode,
                        preview: preview
                    }));
                }).catch(reject);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Resolves preview data for policy evaluation.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} options Policy options.
     * @returns {Promise<Object>} Preview data.
     */
    resolvePreview: function (request, options) {
        if (options.preview) {
            return Promise.resolve(options.preview);
        }
        if (!SERVICE.DefaultRuntimeConfigurationPreviewService ||
            typeof SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Runtime configuration preview service is required for activation policy'));
        }
        return SERVICE.DefaultRuntimeConfigurationPreviewService.previewActivation({
            tenant: request.tenant || CONFIG.get('defaultTenant') || 'default',
            authData: request.authData,
            autData: request.autData,
            correlationId: request.correlationId,
            preview: {
                configurationType: options.configurationType,
                configurationCode: options.configurationCode,
                configuration: options.configuration
            }
        }).then(success => success.data);
    },

    /**
     * Creates a normalized activation policy decision.
     *
     * @param {Object} decision Decision fields.
     * @returns {Object} Normalized decision.
     */
    createDecision: function (decision) {
        return {
            approvalStatus: decision.approvalStatus,
            riskLevel: decision.riskLevel,
            approved: decision.approved,
            approvedBy: decision.approvedBy,
            approvalReason: decision.approvalReason,
            activationRequestCode: decision.activationRequestCode,
            preview: decision.preview,
            reason: decision.reason
        };
    },

    /**
     * Creates a policy rejection error with preview context.
     *
     * @param {Object} options Policy options.
     * @param {Object} preview Preview data.
     * @param {Object} approval Approval payload.
     * @returns {CLASSES.NodicsError} Policy error.
     */
    createPolicyError: function (options, preview, approval) {
        let error = new CLASSES.NodicsError('ERR_SYS_00002', 'Runtime configuration activation requires approval for destructive changes');
        error.configurationType = options.configurationType;
        error.configurationCode = options.configurationCode;
        error.approvalStatus = 'REQUIRED';
        error.riskLevel = 'HIGH';
        error.warnings = preview.warnings || [];
        error.changedPaths = preview.changedPaths || [];
        return error;
    },

    /**
     * Resolves approval only from a persisted approved activation request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Verified approval payload.
     */
    resolveApproval: function (request, options) {
        let eventData = request.event && request.event.data ? request.event.data : {};
        let approval = request.activationApproval || eventData.activationApproval || {};
        let activationRequestCode = approval.activationRequestCode || request.activationRequestCode;
        if (request.runtimeActivationSource !== 'approvedRequest' || request.trustedRuntimeActivation !== true || !activationRequestCode || !SERVICE.DefaultConfigurationActivationRequestService) {
            return Promise.resolve({ approved: false, activationRequestCode: activationRequestCode });
        }
        let authData = SERVICE.DefaultIdentityGovernanceService && SERVICE.DefaultIdentityGovernanceService.getSystemAuthData ? SERVICE.DefaultIdentityGovernanceService.getSystemAuthData() : request.authData;
        return SERVICE.DefaultConfigurationActivationRequestService.get({
            tenant: request.tenant || CONFIG.get('defaultTenant') || 'default', authData: authData,
            query: { code: activationRequestCode }, options: { recursive: false }
        }).then(result => {
            let persisted = result.result && result.result[0];
            let valid = persisted && persisted.approvalStatus === 'APPROVED' && persisted.status === 'APPROVED' &&
                persisted.configurationType === options.configurationType && persisted.configurationCode === options.configurationCode;
            if (!valid) return { approved: false, activationRequestCode: activationRequestCode };
            let actor = this.resolveRequestedBy(request);
            let governance = CONFIG.get('identityGovernance') || {};
            let separation = governance.separationOfDuties || {};
            if (!actor || (separation.preventRequesterActivation !== false && actor === persisted.requestedBy) || (separation.preventApproverActivation !== false && actor === persisted.approvedBy)) {
                throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime activation violates separation-of-duties policy');
            }
            return { approved: true, approvedBy: persisted.approvedBy, approvalReason: persisted.approvalReason, activationRequestCode: persisted.code };
        });
    },

    /**
     * Determines if policy should be bypassed for non-change activation paths.
     *
     * @param {Object} request Nodics request context.
     * @returns {boolean} True when policy should not block activation.
     */
    isPolicyBypassed: function (request) {
        return request.runtimeActivationSource === 'startup' ||
            request.runtimeActivationSource === 'rollback' ||
            request.skipRuntimeActivationPolicy === true;
    },

    /**
     * Extracts a user/process identifier from a runtime request.
     *
     * @param {Object} request Runtime request.
     * @returns {string|undefined} Requesting user or process.
     */
    resolveRequestedBy: function (request) {
        let authData = request && (request.authData || request.autData);
        if (!authData) {
            return undefined;
        }
        return authData.loginId || authData.serviceId || authData.sub || authData.code || authData.userId || authData.uid || authData.email;
    }
};
