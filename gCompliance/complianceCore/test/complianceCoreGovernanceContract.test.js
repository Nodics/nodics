/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const contextService = require('../src/service/defaultComplianceContextService');
const governanceService = require('../src/service/defaultComplianceGovernanceService');
const enums = require('../src/utils/enums');
const statuses = require('../src/utils/statusDefinitions');

describe('Compliance Core governance contract', function () {
    const request = { authData: { tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', permissions: ['compliance.case.read'] } };

    it('resolves authoritative subject scope and rejects cross-tenant assertions', function () {
        const context = contextService.resolve(request, { subjectType: 'PROFILE', subjectCode: 'profile-1' });
        assert.deepStrictEqual(context, { tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', subjectType: 'PROFILE', subjectCode: 'profile-1' });
        assert.throws(() => contextService.resolve(request, { tenantCode: 'tenant-b', subjectType: 'PROFILE', subjectCode: 'profile-1' }), error => error.code === 'ERR_CMP_00003');
    });

    it('enforces explicit permission and provides safe common governance helpers', function () {
        assert.strictEqual(governanceService.assertPermission(request, 'compliance.case.read'), true);
        assert.throws(() => governanceService.assertPermission(request, 'compliance.case.decide'), error => error.code === 'ERR_CMP_00002');
        assert.strictEqual(governanceService.mask('ABCD1234', 4), '****1234');
        assert.strictEqual(governanceService.resolveRetentionAction({ legalHold: true, retentionExpiresAt: '2020-01-01' }), 'HOLD');
        assert.strictEqual(governanceService.resolveRetentionAction({ retentionExpiresAt: '2020-01-01' }, Date.parse('2021-01-01')), 'DELETE_ELIGIBLE');
    });

    it('publishes bounded terminology, safe audit evidence, and common statuses', function () {
        assert.ok(enums.ComplianceDecisionCode.definition.includes('APPROVED'));
        assert.ok(enums.ComplianceAuditActionCode.definition.includes('SENSITIVE_READ'));
        const evidence = governanceService.sanitizeAuditEvidence({ actionCode: 'DECIDED', caseCode: 'case-1', rawPayload: { secret: true } });
        assert.deepStrictEqual(evidence, { actionCode: 'DECIDED', caseCode: 'case-1' });
        assert.ok(statuses.ERR_CMP_00002);
    });
});
