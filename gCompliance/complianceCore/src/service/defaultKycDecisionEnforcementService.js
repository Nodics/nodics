/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module complianceCore/service/DefaultKycDecisionEnforcementService @description Gives consuming capabilities one fail-closed KYC decision gate without copying KYC profile or policy authority. @layer service @owner complianceCore @override Customer modules may replace entry-point requirement mapping or remote transport while preserving scoped KYC-owned decisions and expiry. */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the config operation within the complianceCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return (CONFIG.get('compliance') || {}).kycEnforcement || {}; },
    /**
     * Executes the enforce operation within the complianceCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} entryPoint Value defined by the surrounding Nodics operation contract.
     * @param {*} context Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    enforce: async function (request, entryPoint, context) {
        const config = this.config(); if (config.enabled === false || (config.requiredByEntryPoint || {})[entryPoint] === false) return { required: false, eligible: true, decision: 'NOT_REQUIRED' };
        const input = Object.assign({}, context || {}, { tenant: request.tenant, authData: request.authData, tenantCode: context && context.tenantCode || request.tenantCode || request.tenant && (request.tenant.code || request.tenant), enterpriseCode: context && context.enterpriseCode || request.enterpriseCode || request.entCode || request.authData && (request.authData.enterpriseCode || request.authData.entCode), subjectType: context && context.subjectType || request.subjectType || 'CUSTOMER', subjectCode: context && context.subjectCode || request.subjectCode || request.customerCode || request.loginId, entryPoint, correlationId: request.correlationId || request.requestCode || request.orderCode || request.cartCode });
        if (!input.tenantCode || !input.enterpriseCode || !input.subjectCode) throw this.error('KYC_ENFORCEMENT_CONTEXT_MISSING');
        let decision;
        if (SERVICE.DefaultKycEligibilityService && typeof SERVICE.DefaultKycEligibilityService.evaluate === 'function') decision = await SERVICE.DefaultKycEligibilityService.evaluate(input);
        else if (SERVICE.DefaultModuleService && typeof SERVICE.DefaultModuleService.fetch === 'function') decision = await SERVICE.DefaultModuleService.fetch({ tenant: request.tenant, authData: request.authData, methodName: 'POST', uri: config.remoteRoute || '/nodics/kyc/v0/eligibility/evaluate', requestBody: input });
        else if (config.failClosed !== false) throw this.error('KYC_AUTHORITY_UNAVAILABLE');
        else return { required: true, eligible: false, decision: 'UNAVAILABLE' };
        const value = decision && (decision.data || decision.result || decision);
        if (!value || value.eligible !== true || new Date(value.expiresAt).getTime() <= Date.now()) { const error = this.error('KYC_VERIFICATION_REQUIRED'); error.kycDecision = value && { decisionId: value.decisionId, decision: value.decision, reasonCode: value.reasonCode, expiresAt: value.expiresAt }; throw error; }
        return value;
    },
    /**
     * Executes the error operation within the complianceCore-owned layered contract.
     *
     * @param {*} code Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (code) { const error = new Error(code); error.code = code; return error; }
};
