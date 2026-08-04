/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const service = require('../src/service/defaultKycLifecycleProjectionService');
const pipelines = require('../src/pipelines/pipelines').handleKycProviderWebhookPipeline;

describe('KYC lifecycle projection contract', function () {
    const originalConfig = global.CONFIG; const originalService = global.SERVICE;
    afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });

    it('routes provider evidence directly into the atomic projection node', function () {
        assert.strictEqual(pipelines.nodes.normalizeEvidence.success, 'continueWorkflow');
        assert.strictEqual(pipelines.nodes.appendProviderCheck, undefined);
    });

    it('atomically projects a provider result before Workflow, event, and notification continuation', async function () {
        const writes = []; const continuations = []; const transactionContext = { transactionId: 'tx' };
        const caseModel = { caseCode: 'case-1', profileCode: 'profile-1', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', subjectType: 'CUSTOMER', subjectCode: 'customer-1', policyCode: 'policy-1', correlationId: 'correlation-1', workflowCode: 'case-1', checkCodes: [], version: 1 };
        const profile = { profileCode: 'profile-1', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', version: 1 };
        const repository = (name, records) => ({ get: async () => ({ result: records || [] }), save: async input => { assert.strictEqual(input.transactionContext, transactionContext); writes.push(name); return input.model; }, update: async input => { assert.strictEqual(input.transactionContext, transactionContext); writes.push(name); return { modifiedCount: 1 }; } });
        global.CONFIG = { get: key => key === 'kyc' ? { persistence: { requireAtomicSubmission: true, transactionModuleName: 'kycSchema' }, policy: { expiryDays: 365 }, workflows: { reviewSlaHours: 24 } } : {} };
        global.SERVICE = {
            DefaultDatabaseTransactionService: { execute: async (scope, work) => { const result = await work(transactionContext); writes.push('COMMIT'); return result; } },
            DefaultKycVerificationCaseService: repository('case', [caseModel]), DefaultKycProfileService: repository('profile', [profile]),
            DefaultKycCheckService: repository('check'), DefaultKycDecisionService: repository('decision'), DefaultKycReviewTaskService: repository('review'), DefaultKycAuditEventService: repository('audit'),
            DefaultKycPolicyService: { hashSubjectCode: () => 'subject-hash' },
            DefaultKycWorkflowContinuationService: { continue: async (request, projection) => continuations.push(['workflow', projection.outcome]) },
            DefaultEventService: { handleEvent: async input => continuations.push(['event', input.event.event]) },
            DefaultNotifyDeliveryService: { send: async (request, input) => continuations.push(['notify', input.idempotencyKey]) }
        };
        const result = await service.project({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', authData: {}, caseCode: 'case-1', checkType: 'DOCUMENT_AUTHENTICITY', safeProviderEvidence: { providerCode: 'mockKyc', providerCheckRef: 'check-ref', decision: 'APPROVED' } });
        assert.strictEqual(result.status, 'APPROVED');
        assert.deepStrictEqual(writes, ['check', 'decision', 'case', 'profile', 'audit', 'COMMIT']);
        assert.deepStrictEqual(continuations.map(value => value[0]), ['workflow', 'event', 'notify']);
    });

    it('creates an SLA-bound manual review task for inconclusive evidence', function () {
        assert.strictEqual(service.resolveOutcome({ safeProviderEvidence: { decision: 'INCONCLUSIVE' } }), 'MANUAL_REVIEW_REQUIRED');
    });
});
