/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const service = require('../src/service/defaultKycReviewLifecycleService');
const properties = require('../config/properties');

describe('KYC manual review and maker-checker contract', function () {
    const originalConfig = global.CONFIG; const originalService = global.SERVICE; let task; let audits; let decisions;
    beforeEach(function () {
        task = { reviewTaskCode: 'review-1', caseCode: 'case-1', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', queueCode: 'MANUAL', priority: 'NORMAL', dueAt: new Date(Date.now() + 3600000), makerCheckerRequired: true, escalationLevel: 0, safeNotes: [], status: 'CLAIMED', version: 1 };
        audits = []; decisions = [];
        global.CONFIG = { get: key => key === 'kyc' ? properties.kyc : {} };
        global.SERVICE = {
            DefaultKycReviewTaskService: { get: async () => ({ result: [task] }), update: async input => { task = Object.assign({}, task, input.model.$set); return { modifiedCount: 1 }; } },
            DefaultKycAuditService: { record: async (request, input) => audits.push(input) },
            DefaultKycService: { performCaseAction: async input => { decisions.push(input); return { status: input.action }; } },
            DefaultWorkflowService: { delegateAction: async () => true, takeoverAction: async () => true }
        };
    });
    afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });
    const request = (actor, action, extra) => Object.assign({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', reviewTaskCode: 'review-1', action, reasonCode: 'REVIEWED', authData: { principalId: actor, permissions: Object.values(properties.kyc.workflows.reviewActionPermissions) } }, extra || {});

    it('persists a maker request and requires a different checker', async function () {
        const pending = await service.mutate(request('maker-1', 'REQUEST_CHECKER', { requestedAction: 'APPROVE' }));
        assert.strictEqual(pending.status, 'CHECKER_PENDING'); assert.strictEqual(task.makerReference, 'maker-1'); assert.strictEqual(decisions.length, 0);
        await assert.rejects(() => service.mutate(request('maker-1', 'APPROVE')), error => error.code === 'KYC_MAKER_CHECKER_REQUIRED');
        const approved = await service.mutate(request('checker-1', 'APPROVE'));
        assert.strictEqual(approved.status, 'COMPLETED'); assert.strictEqual(task.checkerReference, 'checker-1'); assert.strictEqual(decisions[0].makerChecker.makerReference, 'maker-1'); assert.strictEqual(decisions[0].makerChecker.checkerReference, 'checker-1');
    });

    it('supports assignment, takeover, escalation, safe notes, and audit evidence', async function () {
        task.status = 'OPEN';
        const assigned = await service.mutate(request('lead-1', 'ASSIGN', { targetReference: 'reviewer-1', safeNote: 'Assigned for identity review.' }));
        assert.strictEqual(assigned.assignedTo, 'reviewer-1'); assert.strictEqual(task.safeNotes.length, 1); assert.strictEqual(audits[0].operation, 'REVIEW_ACTIONED');
        await service.mutate(request('reviewer-2', 'TAKEOVER'));
        assert.strictEqual(task.assignedTo, 'reviewer-2'); assert.strictEqual(task.status, 'CLAIMED');
        await service.mutate(request('reviewer-2', 'ESCALATE'));
        assert.strictEqual(task.status, 'ESCALATED'); assert.strictEqual(task.escalationLevel, 1);
    });

    it('applies persisted maker-checker to high-risk and exception actions', async function () {
        await service.mutate(request('maker-1', 'REQUEST_CHECKER', { requestedAction: 'HIGH_RISK_APPROVAL' }));
        await service.mutate(request('checker-1', 'HIGH_RISK_APPROVAL'));
        assert.strictEqual(task.status, 'COMPLETED'); assert.strictEqual(task.makerReference, 'maker-1'); assert.strictEqual(task.checkerReference, 'checker-1');
        assert.strictEqual(decisions[0].action, 'HIGH_RISK_APPROVAL');
    });

    it('publishes backend-driven review lifecycle actions for Axis', function () {
        const review = properties.backofficeCapabilities.kyc.navigation.find(item => item.id === 'kyc-reviews');
        ['claim', 'takeover', 'request-information', 'escalate', 'request-checker', 'approve', 'reject'].forEach(id => assert.ok(review.lifecycleActions.some(action => action.id === id)));
    });
});
