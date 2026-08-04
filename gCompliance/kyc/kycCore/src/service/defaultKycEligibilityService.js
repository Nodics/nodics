/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/service/DefaultKycEligibilityService @description Loads authoritative KYC state and returns a bounded versioned eligibility decision. @layer service @owner kycCore @override Later modules may replace scoped loading and policy while preserving KYC authority and bounded contracts. */
const crypto = require('crypto');
const list = value => value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : [];
const fail = (message, code) => Object.assign(new Error(message), { code });

module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the config operation within the kycCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return (CONFIG.get('kyc') || {}).eligibility || {}; },
    /**
     * Evaluates the module artifact within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    evaluate: async function (request) {
        if (request.kycProfile) throw fail('Caller-supplied KYC profile authority is prohibited.', 'KYC_EVIDENCE_REJECTED');
        const context = SERVICE.DefaultComplianceContextService.resolve(request, request);
        const profileIdentityHash = crypto.createHash('sha256').update([context.tenantCode, context.enterpriseCode, context.subjectType, context.subjectCode].join('|')).digest('hex');
        const profiles = list(await SERVICE.DefaultKycProfileService.get({ tenant: request.tenant, authData: request.authData, query: { profileIdentityHash }, searchOptions: { limit: 2 } }, {}));
        if (profiles.length > 1) throw fail('Duplicate authoritative KYC profiles were found.', 'KYC_STATE_CONFLICT');
        const profile = profiles[0]; let decision;
        if (profile && profile.latestDecisionCode) {
            const decisions = list(await SERVICE.DefaultKycDecisionService.get({ tenant: request.tenant, authData: request.authData, query: { decisionCode: profile.latestDecisionCode, tenantCode: context.tenantCode, enterpriseCode: context.enterpriseCode }, searchOptions: { limit: 2 } }, {}));
            if (decisions.length !== 1) throw fail('The authoritative KYC decision projection is inconsistent.', 'KYC_STATE_CONFLICT');
            decision = decisions[0];
        }
        const evaluation = SERVICE.DefaultKycPolicyService.evaluateEligibility(request, profile);
        const config = this.config(); const issuedAt = new Date(); const maximumTtlSeconds = Number(config.maximumTtlSeconds || 300);
        const profileExpiry = profile && profile.expiresAt ? new Date(profile.expiresAt).getTime() : issuedAt.getTime() + maximumTtlSeconds * 1000;
        const expiresAt = new Date(Math.min(profileExpiry, issuedAt.getTime() + maximumTtlSeconds * 1000));
        const contract = { contractVersion: Number(config.contractVersion || 1), decisionId: crypto.createHash('sha256').update([profile && profile.profileCode || 'none', decision && decision.decisionCode || 'none', request.entryPoint, issuedAt.toISOString()].join('|')).digest('hex'), tenantCode: context.tenantCode, enterpriseCode: context.enterpriseCode, subjectType: context.subjectType, subjectReference: crypto.createHash('sha256').update(context.subjectCode).digest('hex'), entryPoint: request.entryPoint, eligible: evaluation.eligible, decision: evaluation.decision, reasonCode: evaluation.reasonCode, policyCode: evaluation.policy.policyCode, profileVersion: profile && profile.version, decisionCode: decision && decision.decisionCode, issuedAt, expiresAt, cache: { private: true, maximumTtlSeconds, invalidateOn: [...(config.invalidateOn || [])] } };
        if (SERVICE.DefaultKycAuditService) await SERVICE.DefaultKycAuditService.record(request, { tenantCode: context.tenantCode, enterpriseCode: context.enterpriseCode, caseCode: profile && profile.latestCaseCode, subjectType: context.subjectType, subjectCodeHash: contract.subjectReference, operation: 'ELIGIBILITY_EVALUATED', permissionCode: 'kyc.eligibility.evaluate', correlationId: request.correlationId || contract.decisionId, outcome: contract.decision, safeEvidence: { decisionId: contract.decisionId, entryPoint: contract.entryPoint, policyCode: contract.policyCode }, occurredAt: issuedAt });
        return contract;
    }
};
