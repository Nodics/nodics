/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const transitions = Object.freeze({
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['DOCUMENTS_REQUIRED', 'PROVIDER_PENDING', 'MANUAL_REVIEW_REQUIRED', 'FAILED', 'CANCELLED'],
    DOCUMENTS_REQUIRED: ['SUBMITTED', 'EXPIRED', 'CANCELLED'],
    PROVIDER_PENDING: ['PROVIDER_COMPLETED', 'MANUAL_REVIEW_REQUIRED', 'FAILED', 'EXPIRED'],
    PROVIDER_COMPLETED: ['APPROVED', 'REJECTED', 'MANUAL_REVIEW_REQUIRED'],
    MANUAL_REVIEW_REQUIRED: ['APPROVED', 'REJECTED', 'ESCALATED', 'DOCUMENTS_REQUIRED', 'EXPIRED'],
    ESCALATED: ['APPROVED', 'REJECTED', 'DOCUMENTS_REQUIRED', 'EXPIRED'],
    APPROVED: ['EXPIRED'],
    REJECTED: ['MANUAL_REVIEW_REQUIRED', 'APPROVED'], EXPIRED: ['SUBMITTED'], CANCELLED: [], FAILED: ['SUBMITTED']
});

const decisionActions = Object.freeze({
    APPROVE: 'APPROVED', REJECT: 'REJECTED', REQUEST_MORE_INFORMATION: 'DOCUMENTS_REQUIRED',
    ESCALATE: 'ESCALATED', CANCEL: 'CANCELLED', EXPIRE: 'EXPIRED', REVERIFY: 'SUBMITTED',
    OVERRIDE: 'APPROVED', REJECTION_REVERSAL: 'MANUAL_REVIEW_REQUIRED',
    HIGH_RISK_APPROVAL: 'APPROVED', POLICY_EXCEPTION: 'APPROVED'
});

/**
 * @module gCompliance/kyc/kycCore/src/service/defaultKycLifecycleService
 * @description Defines the default kyc lifecycle service contract owned by kycCore within the Nodics layered runtime.
 * @layer service
 * @owner kycCore
 * @override Later project or customer modules may replace or extend this artifact while preserving its published contract.
 */
module.exports = {
    init: () => Promise.resolve(true),
    postInit: () => Promise.resolve(true),
    transitions,

    /**

     * Asserts transition within the kycCore-owned layered contract.

     *

     * @param {*} currentStatus Value defined by the surrounding Nodics operation contract.

     * @param {*} nextStatus Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    assertTransition: function (currentStatus, nextStatus) {
        if (!(transitions[currentStatus] || []).includes(nextStatus)) {
            const error = new Error(`KYC case cannot transition from ${currentStatus} to ${nextStatus}.`);
            error.code = 'KYC_STATE_CONFLICT';
            throw error;
        }
        return true;
    },

    /**

     * Resolves action within the kycCore-owned layered contract.

     *

     * @param {*} action Value defined by the surrounding Nodics operation contract.

     * @param {*} currentStatus Value defined by the surrounding Nodics operation contract.

     * @param {*} context Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    resolveAction: function (action, currentStatus, context) {
        const nextStatus = decisionActions[action];
        if (!nextStatus) {
            const error = new Error('Unsupported KYC intent action.');
            error.code = 'KYC_ACTION_NOT_SUPPORTED';
            throw error;
        }
        this.assertTransition(currentStatus, nextStatus);
        const makerChecker = context && context.makerChecker;
        if (makerChecker && makerChecker.required && makerChecker.makerReference === makerChecker.checkerReference) {
            const error = new Error('Maker and checker must be different principals.');
            error.code = 'KYC_MAKER_CHECKER_REQUIRED';
            throw error;
        }
        return { action, previousStatus: currentStatus, status: nextStatus, terminal: ['APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'FAILED'].includes(nextStatus) };
    },

    /**

     * Normalizes provider evidence within the kycCore-owned layered contract.

     *

     * @param {*} evidence Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    normalizeProviderEvidence: function (evidence) {
        const allowed = ['providerCode', 'providerCaseRef', 'providerDocumentRef', 'providerCheckRef', 'status', 'decision', 'reasonCode', 'safeMessage', 'eventTime'];
        return allowed.reduce((result, key) => {
            if (evidence && evidence[key] !== undefined) result[key] = evidence[key];
            return result;
        }, {});
    },

    /**

     * Asserts private media reference within the kycCore-owned layered contract.

     *

     * @param {*} document Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    assertPrivateMediaReference: function (document) {
        if (!document || !document.mediaCode || document.visibility !== 'PRIVATE' || document.path || document.fullPath || document.url) {
            const error = new Error('KYC documents require a private nMedia code and must not include paths or URLs.');
            error.code = 'KYC_EVIDENCE_REJECTED';
            throw error;
        }
        return true;
    },

    /**

     * Executes the verify webhook envelope operation within the kycCore-owned layered contract.

     *

     * @param {*} envelope Value defined by the surrounding Nodics operation contract.

     * @param {*} now Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    verifyWebhookEnvelope: function (envelope, now) {
        if (!envelope || !envelope.signatureVerified || !envelope.eventId || !envelope.providerCode || !envelope.tenantCode || !envelope.enterpriseCode) {
            const error = new Error('The KYC provider callback envelope is invalid.');
            error.code = 'KYC_WEBHOOK_REJECTED';
            throw error;
        }
        if (envelope.replayed === true || envelope.idempotencyAccepted === false) {
            const error = new Error('The KYC provider callback was already processed.');
            error.code = 'KYC_WEBHOOK_REPLAYED';
            throw error;
        }
        const current = now === undefined ? Date.now() : now;
        if (!envelope.eventTime || new Date(envelope.eventTime).getTime() > current + 300000) {
            const error = new Error('The KYC provider callback timestamp is invalid.');
            error.code = 'KYC_WEBHOOK_REJECTED';
            throw error;
        }
        return true;
    }
};
