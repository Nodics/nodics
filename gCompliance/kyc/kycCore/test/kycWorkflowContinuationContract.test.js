/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const service = require('../src/service/defaultKycWorkflowContinuationService');
describe('KYC Workflow continuation contract', function () {
    const originalService = global.SERVICE; afterEach(function () { global.SERVICE = originalService; });
    const projection = { caseModel: { caseCode: 'case-1', workflowCode: 'carrier-1' }, decision: { decisionCode: 'decision-1' }, check: { checkCode: 'check-1' }, outcome: 'APPROVED' };
    it('validates carrier/case consistency and performs a bounded action', async function () {
        let action;
        global.SERVICE = { DefaultWorkflowCarrierService: { getByCode: async () => ({ result: { code: 'carrier-1', sourceDetail: { caseCode: 'case-1' } } }) }, DefaultWorkflowService: { performAction: async input => { action = input; return true; } } };
        const result = await service.continue({ tenant: 't1', authData: {} }, projection);
        assert.strictEqual(result.idempotent, false); assert.strictEqual(action.carrierCode, 'carrier-1'); assert.strictEqual(action.actionResponse.feedback.decisionCode, 'decision-1');
    });
    it('rejects a carrier belonging to another case', async function () {
        global.SERVICE = { DefaultWorkflowCarrierService: { getByCode: async () => ({ result: { code: 'carrier-1', sourceDetail: { caseCode: 'case-other' } } }) }, DefaultWorkflowService: { performAction: async () => true } };
        await assert.rejects(() => service.continue({ tenant: 't1', authData: {} }, projection), error => error.code === 'KYC_STATE_CONFLICT');
    });
    it('treats the same persisted decision response as idempotent', async function () {
        let calls = 0;
        global.SERVICE = { DefaultWorkflowCarrierService: { getByCode: async () => ({ result: { code: 'carrier-1', sourceDetail: { caseCode: 'case-1' }, activeAction: { actionResponse: { feedback: { decisionCode: 'decision-1' } } } } }) }, DefaultWorkflowService: { performAction: async () => { calls += 1; } } };
        const result = await service.continue({ tenant: 't1', authData: {} }, projection);
        assert.strictEqual(result.idempotent, true); assert.strictEqual(calls, 0);
    });
});
