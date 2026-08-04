/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const service = require('../src/service/defaultKycLifecycleGovernanceService');
describe('KYC scheduled lifecycle governance contract', function () {
    let profileUpdates; let documentUpdates; let deleted; let held; let audits; let notifications; let workflows;
    beforeEach(function () {
        profileUpdates = []; documentUpdates = []; deleted = []; held = []; audits = []; notifications = []; workflows = [];
        global.CONFIG = { get: key => key === 'kyc.lifecycle' ? { batchSize: 10, reverificationNoticeDays: 30 } : key === 'kyc.documents' ? { mediaPurpose: 'kycDocuments' } : {} };
        const now = Date.now();
        global.SERVICE = {
            DefaultKycProfileService: { get: async () => ({ result: [{ profileCode: 'expired', subjectType: 'CUSTOMER', subjectCode: 's1', latestCaseCode: 'c1', expiresAt: new Date(now - 1000), kycStatus: 'APPROVED', version: 1 }, { profileCode: 'notice', subjectType: 'CUSTOMER', subjectCode: 's2', latestCaseCode: 'c2', expiresAt: new Date(now + 86400000), kycStatus: 'APPROVED', version: 1 }] }), update: async input => profileUpdates.push(input) },
            DefaultKycDocumentService: { get: async () => ({ result: [{ documentCode: 'delete', mediaCode: 'm1', caseCode: 'c1', retentionUntil: new Date(now - 1000), legalHold: false, status: 'UPLOADED', version: 1 }, { documentCode: 'hold', mediaCode: 'm2', caseCode: 'c2', retentionUntil: new Date(now - 1000), legalHold: true, status: 'UPLOADED', version: 1 }] }), update: async input => documentUpdates.push(input) },
            DefaultMediaLifecycleCoordinationService: { deleteExpired: async input => deleted.push(input.mediaCode), setLegalHold: async input => held.push(input.mediaCode), bind: async input => input },
            DefaultKycAuditService: { record: async (request, input) => audits.push(input) }, DefaultEventService: { publish: async () => true }, DefaultNotifyDeliveryService: { send: async (request, input) => notifications.push(input) }, DefaultWorkflowService: { initCarrierItem: async input => workflows.push(input) }
        };
    });
    it('expires, requests re-verification, honors legal hold, and deletes through nMedia', async function () { const result = await service.run({ tenant: 't1', enterpriseCode: 'e1', now: new Date() }); assert.strictEqual(result.expiredProfiles, 1); assert.strictEqual(result.reverificationNotices, 1); assert.strictEqual(result.deletedDocuments, 1); assert.strictEqual(result.heldDocuments, 1); assert.deepStrictEqual(deleted, ['m1']); assert.deepStrictEqual(held, ['m2']); assert.strictEqual(profileUpdates.length, 2); assert.strictEqual(documentUpdates.length, 1); assert.strictEqual(notifications.length, 2); assert.strictEqual(workflows.length, 2); assert.ok(audits.some(value => value.operation === 'DOCUMENT_DELETED')); });
    it('publishes an inactive configuration-first CronJob definition', function () { const data = require('../data/init/data/lifecycle/defaultKycLifecycleCronJobData'); assert.strictEqual(data.kycLifecycleGovernanceJob.active, false); assert.strictEqual(data.kycLifecycleGovernanceJob.jobDetail.startNode, 'DefaultKycLifecycleGovernanceService.run'); });
});
