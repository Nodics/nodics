/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Licensed under the root license. */
/**
 * @module gCompliance/kyc/kycCore/src/service/defaultKycVerificationWorkflowService
 * @description Defines the default kyc verification workflow service contract owned by kycCore within the Nodics layered runtime.
 * @layer service
 * @owner kycCore
 * @override Later project or customer modules may replace or extend this artifact while preserving its published contract.
 */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Performs head operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    performHeadOperation: function (request) { return Promise.resolve({ decision: 'SUBMIT', item: request.workflowCarrier && request.workflowCarrier.item }); },
    /**
     * Executes the submit provider operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    submitProvider: function (request) {
        const item = request.workflowCarrier && request.workflowCarrier.item || request.item || {};
        const providerCode = item.providerCode || (CONFIG.get('kyc.providerExecution') || {}).defaultProvider || 'mockKyc';
        return SERVICE.DefaultKycProviderExecutionService.execute(Object.assign({}, request, item, { providerCode }), 'createCase').then(evidence => {
            const safe = SERVICE.DefaultKycProviderRegistryService.normalizeEvidence(evidence);
            return { decision: safe.decision || 'MANUAL_REVIEW_REQUIRED', providerEvidence: safe };
        }).catch(error => ({ decision: 'MANUAL_REVIEW_REQUIRED', reasonCode: error.code || 'KYC_PROVIDER_UNAVAILABLE' }));
    },
    /**
     * Executes the complete decision operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    completeDecision: function (request) {
        const response = request.actionResponse || request.response || {};
        return Promise.resolve({ decision: 'SUCCESS', caseCode: request.workflowCarrier && request.workflowCarrier.item && request.workflowCarrier.item.caseCode, result: response.decision });
    }
};
