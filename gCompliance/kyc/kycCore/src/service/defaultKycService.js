/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module gCompliance/kyc/kycCore/src/service/defaultKycService
 * @description Implements kyc default kyc service business behavior and extension logic.
 * @layer service
 * @owner kyc
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

     * Initializes mobile kyc behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    initMobileKyc: async function (request, response) {
        await SERVICE.DefaultKycRateLimitService.enforce('resend', request);
        request.kycService = this;
        request.type = ENUMS.KYCType.MOBILE.key;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('initializeMobileKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing mobile KYC'));
            }
        });
    },
    /**
     * Validates mobile kyc rules.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    validateMobileKyc: function (request, response) {
        request.kycService = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('validateMobileKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while validating mobile KYC'));
            }
        });
    },

    /**

     * Initializes email kyc behavior for the module runtime.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    initEmailKyc: async function (request, response) {
        await SERVICE.DefaultKycRateLimitService.enforce('resend', request);
        request.kycService = this;
        request.type = ENUMS.KYCType.EMAIL.key;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('initializeEmailKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while initializing email KYC'));
            }
        });
    },
    /**
     * Validates email kyc rules.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    validateEmailKyc: function (request, response) {
        request.kycService = this;
        return new Promise((resolve, reject) => {
            try {
                SERVICE.DefaultPipelineService.start('validateEmailKycPipeline', request, {}).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.WorkflowError('Facing issue while validating email KYC'));
            }
        });
    },

    /** Starts the configuration-driven, idempotent KYC case submission pipeline. */
    submitCase: async function (request) {
        await SERVICE.DefaultKycRateLimitService.enforce('submit', request);
        request.kycService = this;
        return SERVICE.DefaultPipelineService.start('submitKycCasePipeline', request, {});
    },

    /** Executes a permissioned KYC intent through the review pipeline. */
    performCaseAction: async function (request) {
        await SERVICE.DefaultKycRateLimitService.enforce('decision', request);
        request.kycService = this;
        return SERVICE.DefaultPipelineService.start('reviewKycCasePipeline', request, {});
    },

    /** Executes a governed review-task lifecycle action. */
    performReviewTaskAction: async function (request) {
        await SERVICE.DefaultKycRateLimitService.enforce('decision', request);
        return SERVICE.DefaultKycReviewLifecycleService.mutate(request);
    },
    /**
     * Executes the deliver document operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    deliverDocument: function (request) {
        return SERVICE.DefaultKycMediaEvidenceService.deliver(request);
    },

    /** Returns a KYC-owned eligibility decision for another backend capability. */
    evaluateEligibility: function (request) {
        return SERVICE.DefaultKycEligibilityService.evaluate(request);
    },
    /**
     * Executes the manage provider operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    manageProvider: function (request) { return SERVICE.DefaultKycConfigurationGovernanceService.manageProvider(request); },
    /**
     * Executes the manage provider policy operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    manageProviderPolicy: function (request) { return SERVICE.DefaultKycConfigurationGovernanceService.managePolicy(request); },
    /**
     * Summarizes operations within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    summarizeOperations: function (request) { return SERVICE.DefaultKycOperationsDashboardService.summarize(request); },

    /** Normalizes an authenticated provider callback through the callback pipeline. */
    handleProviderWebhook: async function (request) {
        request.kycService = this;
        await SERVICE.DefaultKycRateLimitService.enforce('callback', request);
        const verification = await SERVICE.DefaultKycProviderWebhookService.verify(request);
        request.webhookVerification = verification.webhookVerification;
        request.webhookEnvelope = verification.webhookEnvelope;
        try {
            const result = await SERVICE.DefaultPipelineService.start('handleKycProviderWebhookPipeline', request, {});
            await SERVICE.DefaultKycProviderWebhookService.complete(request, verification, result);
            return result;
        } catch (error) {
            await SERVICE.DefaultKycProviderWebhookService.complete(request, verification, undefined, error);
            throw error;
        }
    },
};
