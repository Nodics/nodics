/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert'); const service = require('../src/service/defaultKycConfigurationGovernanceService');
describe('KYC provider and policy governance contract', function () {
    let providerUpdate; let policyUpdate; let audits;
    beforeEach(function () { audits = []; global.SERVICE = { DefaultKycProviderService: { update: async input => { providerUpdate = input; return { modifiedCount: 1 }; } }, DefaultKycProviderExecutionPolicyService: { update: async input => { policyUpdate = input; return { modifiedCount: 1 }; } }, DefaultKycAuditService: { record: async (request, input) => audits.push(input) } }; });
    const request = permissions => ({ tenant: 't1', tenantCode: 't1', enterpriseCode: 'e1', expectedVersion: 2, reasonCode: 'CHANGE_APPROVED', authData: { principalId: 'maker', permissions }, approvalEvidence: { approvedByPrincipalId: 'checker', reasonCode: 'APPROVED' } });
    it('requires independent approval and audits production provider activation', async function () { const input = Object.assign(request(['kyc.provider.manage']), { providerCode: 'provider-1', productionReady: true, status: 'ACTIVE', secretReference: 'vault://provider' }); const result = await service.manageProvider(input); assert.strictEqual(result.version, 3); assert.strictEqual(providerUpdate.query.version, 2); assert.strictEqual(audits[0].operation, 'PROVIDER_CHANGED'); input.approvalEvidence.approvedByPrincipalId = 'maker'; await assert.rejects(() => service.manageProvider(input), error => error.code === 'KYC_MAKER_CHECKER_REQUIRED'); });
    it('allows only secret references and audits live policy changes', async function () { const input = Object.assign(request(['kyc.policy.manage']), { providerPolicyCode: 'policy-1', liveCallsEnabled: true, timeoutMs: 1000 }); await service.managePolicy(input); assert.strictEqual(policyUpdate.model.$set.version, 3); assert.strictEqual(audits[0].operation, 'POLICY_CHANGED'); await assert.rejects(() => service.manageProvider(Object.assign(request(['kyc.provider.manage']), { providerCode: 'p1', secret: 'raw' })), error => error.code === 'KYC_EVIDENCE_REJECTED'); });
});
