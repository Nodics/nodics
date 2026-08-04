/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

const required = (value, name) => {
    if (value === undefined || value === null || value === '') {
        const error = new Error(`Missing required KYC field: ${name}`);
        error.code = 'KYC_INVALID_REQUEST';
        throw error;
    }
    return value;
};

const resolveConfiguration = () => {
    if (typeof CONFIG !== 'undefined' && CONFIG && typeof CONFIG.get === 'function') {
        return CONFIG.get('kyc') || {};
    }
    return {};
};

const includes = (expected, actual) => !expected || (Array.isArray(expected) ? expected : [expected]).includes(actual);
const overlaps = (expected, actual) => !expected || (actual || []).some(value => expected.includes(value));
const exactInteger = (value, field) => { const text = String(value === undefined ? '0' : value); if (!/^\d+$/.test(text)) { const error = new Error(`Invalid exact KYC policy value: ${field}`); error.code = 'KYC_INVALID_REQUEST'; throw error; } return BigInt(text); };
const matchesRule = (rule, request) => {
    const when = rule.when || {};
    if (!includes(when.tenantCodes, request.tenantCode) || !includes(when.enterpriseCodes, request.enterpriseCode) || !includes(when.siteCodes, request.siteCode) || !includes(when.channelCodes, request.channelCode) || !includes(when.jurisdictions, request.jurisdiction || request.countryCode) || !includes(when.subjectTypes, request.subjectType) || !includes(when.paymentMethodCodes, request.paymentMethodCode) || !includes(when.consentStatuses, request.consentStatus) || !includes(when.previousDecisions, request.previousDecision)) return false;
    if (!overlaps(when.productCodes, request.productCodes) || !overlaps(when.categoryCodes, request.categoryCodes) || !overlaps(when.deviceSignalCodes, request.deviceSignalCodes) || !overlaps(when.previousCheckResultCodes, request.previousCheckResultCodes)) return false;
    if (when.minimumOrderMinorUnits !== undefined && exactInteger(request.orderMinorUnits, 'orderMinorUnits') < exactInteger(when.minimumOrderMinorUnits, 'minimumOrderMinorUnits')) return false;
    if (when.minimumRefundMinorUnits !== undefined && exactInteger(request.refundMinorUnits, 'refundMinorUnits') < exactInteger(when.minimumRefundMinorUnits, 'minimumRefundMinorUnits')) return false;
    if (when.minimumRiskScore !== undefined && Number(request.riskScore || 0) < Number(when.minimumRiskScore)) return false;
    if (when.minimumPriorAttempts !== undefined && Number(request.priorAttempts || 0) < Number(when.minimumPriorAttempts)) return false;
    if (when.maximumDocumentValidityDays !== undefined && Number(request.documentValidityDays === undefined ? Number.MAX_SAFE_INTEGER : request.documentValidityDays) > Number(when.maximumDocumentValidityDays)) return false;
    return true;
};

/**
 * @module gCompliance/kyc/kycCore/src/service/defaultKycPolicyService
 * @description Defines the default kyc policy service contract owned by kycCore within the Nodics layered runtime.
 * @layer service
 * @owner kycCore
 * @override Later project or customer modules may replace or extend this artifact while preserving its published contract.
 */
module.exports = {
    init: () => Promise.resolve(true),
    postInit: () => Promise.resolve(true),

    /**

     * Resolves policy within the kycCore-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @param {*} configuration Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    resolvePolicy: function (request, configuration) {
        const config = configuration || resolveConfiguration();
        const policy = config.policy || {};
        const subjectType = required(request && request.subjectType, 'subjectType');
        const entryPoint = required(request && request.entryPoint, 'entryPoint');
        if (!(policy.supportedSubjectTypes || []).includes(subjectType)) {
            const error = new Error('The subject type is not enabled for KYC.');
            error.code = 'KYC_SUBJECT_TYPE_NOT_SUPPORTED';
            throw error;
        }
        if (!(policy.entryPoints || []).includes(entryPoint)) {
            const error = new Error('The entry point is not enabled for KYC.');
            error.code = 'KYC_ENTRY_POINT_NOT_SUPPORTED';
            throw error;
        }
        const matchedRules = [...(policy.rules || [])].filter(rule => rule.enabled !== false && matchesRule(rule, request)).sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0));
        const selectedRule = matchedRules[0];
        const levelCode = request.verificationLevel || selectedRule && selectedRule.apply && selectedRule.apply.verificationLevel || policy.defaultVerificationLevel;
        const level = (policy.verificationLevels || {})[levelCode];
        if (!level) {
            const error = new Error('The verification level is not configured.');
            error.code = 'KYC_LEVEL_NOT_CONFIGURED';
            throw error;
        }
        return {
            policyCode: request.policyCode || policy.defaultPolicyCode,
            caseType: request.caseType || policy.defaultCaseType,
            subjectType,
            entryPoint,
            verificationLevel: levelCode,
            checkTypes: Array.from(new Set([...(level.checkTypes || []), ...matchedRules.flatMap(rule => rule.apply && rule.apply.additionalCheckTypes || [])])),
            requiredDocumentTypes: Array.from(new Set([...(level.requiredDocumentTypes || []), ...matchedRules.flatMap(rule => rule.apply && rule.apply.additionalDocumentTypes || [])])),
            manualReviewOnInconclusive: level.manualReviewOnInconclusive === true || matchedRules.some(rule => rule.apply && rule.apply.manualReviewRequired === true),
            consent: Object.assign({}, policy.consent),
            retention: Object.assign({}, policy.retention),
            masking: Object.assign({}, policy.masking),
            makerChecker: Object.assign({}, policy.makerChecker),
            reusableDecision: Object.assign({}, policy.reusableDecision, selectedRule && selectedRule.apply && selectedRule.apply.reusableDecision || {}),
            matchedRuleCodes: matchedRules.map(rule => rule.ruleCode),
            stepUpReasonCodes: matchedRules.map(rule => rule.reasonCode).filter(Boolean)
        };
    },

    /**

     * Evaluates eligibility within the kycCore-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @param {*} profile Value defined by the surrounding Nodics operation contract.

     * @param {*} configuration Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    evaluateEligibility: function (request, profile, configuration) {
        const config = configuration || resolveConfiguration();
        const policy = this.resolvePolicy(request, config);
        if (profile && profile.kycStatus === 'APPROVED') {
            const expiresAt = profile.expiresAt ? new Date(profile.expiresAt).getTime() : 0;
            const reusable = policy.reusableDecision.enabled === true &&
                policy.reusableDecision.allowedEntryPoints.includes(request.entryPoint) &&
                (!policy.reusableDecision.requireUnexpired || expiresAt > Date.now());
            if (reusable) return { eligible: true, decision: 'APPROVED', reasonCode: 'KYC_REUSABLE_DECISION', policy };
        }
        return { eligible: false, decision: 'VERIFICATION_REQUIRED', reasonCode: 'KYC_REQUIRED', policy };
    },

    /**

     * Executes the hash subject code operation within the kycCore-owned layered contract.

     *

     * @param {*} subjectCode Value defined by the surrounding Nodics operation contract.

     * @param {*} algorithm Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    hashSubjectCode: function (subjectCode, algorithm) {
        return crypto.createHash(algorithm || 'sha256').update(String(required(subjectCode, 'subjectCode'))).digest('hex');
    },

    /**

     * Executes the mask document number operation within the kycCore-owned layered contract.

     *

     * @param {*} value Value defined by the surrounding Nodics operation contract.

     * @param {*} visibleSuffix Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    maskDocumentNumber: function (value, visibleSuffix) {
        const text = String(required(value, 'documentNumber'));
        const suffix = Math.max(0, Number(visibleSuffix || 4));
        if (text.length <= suffix) return '*'.repeat(text.length);
        return `${'*'.repeat(text.length - suffix)}${text.slice(-suffix)}`;
    }
};
