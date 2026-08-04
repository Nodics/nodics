/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/service/DefaultKycConfigurationGovernanceService @description Applies permissioned, optimistic, maker-checker provider and policy changes with redacted audit evidence. @layer service @owner kycCore @override Customer modules may replace approval policy and field allowlists while retaining secret-reference, scope, concurrency, and audit contracts. */
module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    actor: request => request.authData && (request.authData.principalId || request.authData.loginId || request.authData.userId),
    affected: value => Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || value && value.result && value.result.modifiedCount || 0),
    /**
     * Asserts the module artifact within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} permission Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    assert: function (request, permission) { const actor = this.actor(request); if (!actor || !((request.authData || {}).permissions || []).includes(permission)) throw this.error('KYC_OPERATION_FORBIDDEN', 'Configuration change is not authorized.'); return actor; },
    /**
     * Executes the sanitize operation within the kycCore-owned layered contract.
     *
     * @param {*} input Value defined by the surrounding Nodics operation contract.
     * @param {*} allowed Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    sanitize: function (input, allowed) { const forbidden = ['secret', 'password', 'token', 'credential', 'rawPayload']; forbidden.forEach(field => { if (input[field] !== undefined) throw this.error('KYC_EVIDENCE_REJECTED', 'Raw credentials and provider payloads are prohibited.'); }); return allowed.reduce((result, field) => { if (input[field] !== undefined) result[field] = input[field]; return result; }, {}); },
    /**
     * Executes the require approval operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} actor Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    requireApproval: function (request, actor) { const approval = request.approvalEvidence; if (!approval || !approval.approvedByPrincipalId || approval.approvedByPrincipalId === actor || !approval.reasonCode) throw this.error('KYC_MAKER_CHECKER_REQUIRED', 'An independent persisted approval is required.'); return approval.approvedByPrincipalId; },
    /**
     * Executes the manage provider operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    manageProvider: async function (request) {
        const actor = this.assert(request, 'kyc.provider.manage'); if (!request.providerCode || request.expectedVersion === undefined || !request.reasonCode) throw this.error('KYC_INVALID_REQUEST', 'Provider code, expected version, and reason are required.');
        const patch = this.sanitize(request, ['label', 'adapterService', 'supportedCheckTypes', 'supportedSubjectTypes', 'sandboxSupported', 'productionReady', 'webhookSupported', 'webhookVerifierService', 'healthStatus', 'secretReference', 'status']);
        let checker; if (patch.productionReady === true || patch.status === 'ACTIVE') checker = this.requireApproval(request, actor);
        patch.version = Number(request.expectedVersion) + 1;
        const result = await SERVICE.DefaultKycProviderService.update({ tenant: request.tenant, authData: request.authData, query: { providerCode: request.providerCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, version: request.expectedVersion }, model: { $set: patch } });
        if (this.affected(result) !== 1) throw this.error('KYC_STATE_CONFLICT', 'Provider configuration changed concurrently.');
        await SERVICE.DefaultKycAuditService.record(request, { operation: 'PROVIDER_CHANGED', outcome: patch.status || patch.healthStatus || 'UPDATED', permissionCode: 'kyc.provider.manage', correlationId: `${request.providerCode}:${patch.version}`, safeEvidence: { providerCode: request.providerCode, reasonCode: request.reasonCode, actionCode: 'UPDATE', resultCode: 'UPDATED', checkerReference: checker } });
        return { providerCode: request.providerCode, version: patch.version, status: patch.status, changed: true };
    },
    /**
     * Executes the manage policy operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    managePolicy: async function (request) {
        const actor = this.assert(request, 'kyc.policy.manage'); if (!request.providerPolicyCode || request.expectedVersion === undefined || !request.reasonCode) throw this.error('KYC_INVALID_REQUEST', 'Policy code, expected version, and reason are required.');
        const patch = this.sanitize(request, ['liveCallsEnabled', 'timeoutMs', 'maxAttempts', 'backoffMs', 'failoverProviderCodes', 'retryableErrorCodes', 'nonRetryableErrorCodes', 'circuitFailureThreshold', 'circuitResetMs', 'webhookToleranceSeconds', 'replayWindowSeconds', 'status']);
        let checker; if (patch.liveCallsEnabled === true || patch.status === 'ACTIVE') checker = this.requireApproval(request, actor);
        patch.version = Number(request.expectedVersion) + 1;
        const result = await SERVICE.DefaultKycProviderExecutionPolicyService.update({ tenant: request.tenant, authData: request.authData, query: { providerPolicyCode: request.providerPolicyCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode, version: request.expectedVersion }, model: { $set: patch } });
        if (this.affected(result) !== 1) throw this.error('KYC_STATE_CONFLICT', 'Provider policy changed concurrently.');
        await SERVICE.DefaultKycAuditService.record(request, { operation: 'POLICY_CHANGED', outcome: patch.status || 'UPDATED', permissionCode: 'kyc.policy.manage', correlationId: `${request.providerPolicyCode}:${patch.version}`, safeEvidence: { policyCode: request.providerPolicyCode, reasonCode: request.reasonCode, actionCode: 'UPDATE', resultCode: 'UPDATED', checkerReference: checker } });
        return { providerPolicyCode: request.providerPolicyCode, version: patch.version, status: patch.status, changed: true };
    },
    /**
     * Executes the error operation within the kycCore-owned layered contract.
     *
     * @param {*} code Value defined by the surrounding Nodics operation contract.
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (code, message) { const error = new Error(message); error.code = code; return error; }
};
