/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const service = require('../src/service/defaultKycEligibilityService');
describe('KYC eligibility authority contract', function () {
    const originalConfig = global.CONFIG; const originalService = global.SERVICE;
    afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });
    it('rejects caller-supplied profile authority', async function () { await assert.rejects(() => service.evaluate({ kycProfile: {}, subjectType: 'CUSTOMER', subjectCode: 'c1' }), error => error.code === 'KYC_EVIDENCE_REJECTED'); });
    it('loads scoped profile and decision and returns a bounded expiring contract', async function () {
        const profile = { profileCode: 'p1', latestCaseCode: 'case-1', latestDecisionCode: 'd1', kycStatus: 'APPROVED', expiresAt: new Date(Date.now() + 86400000), version: 3 };
        let audit;
        global.CONFIG = { get: key => key === 'kyc' ? { eligibility: { contractVersion: 2, maximumTtlSeconds: 60, invalidateOn: ['DECISION_CHANGED'] }, policy: {} } : {} };
        global.SERVICE = {
            DefaultComplianceContextService: { resolve: () => ({ tenantCode: 't1', enterpriseCode: 'e1', subjectType: 'CUSTOMER', subjectCode: 'c1' }) },
            DefaultKycProfileService: { get: async () => ({ result: [profile] }) }, DefaultKycDecisionService: { get: async () => ({ result: [{ decisionCode: 'd1' }] }) },
            DefaultKycPolicyService: { evaluateEligibility: () => ({ eligible: true, decision: 'APPROVED', reasonCode: 'KYC_REUSABLE_DECISION', policy: { policyCode: 'policy-1' } }) },
            DefaultKycAuditService: { record: async (request, input) => { audit = input; } }
        };
        const result = await service.evaluate({ tenant: 't1', authData: { serviceName: 'checkout' }, subjectType: 'CUSTOMER', subjectCode: 'c1', entryPoint: 'CHECKOUT' });
        assert.strictEqual(result.contractVersion, 2); assert.strictEqual(result.eligible, true); assert.strictEqual(result.profileVersion, 3); assert.ok(result.expiresAt.getTime() <= Date.now() + 61000); assert.strictEqual(result.subjectCode, undefined); assert.notStrictEqual(result.subjectReference, 'c1'); assert.strictEqual(audit.operation, 'ELIGIBILITY_EVALUATED');
    });
});
