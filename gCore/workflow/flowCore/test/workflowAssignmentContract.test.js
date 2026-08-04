/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available contract test. */
const assert = require('assert');
const service = require('../src/service/workflow/defaultWorkflowAssignmentService');
let carrier;
global.SERVICE = { DefaultWorkflowCarrierService: { getByCode: async () => ({ result: carrier }), save: async request => ({ result: request.model }) } };
const request = (principalId, assignment) => ({ tenant: 'default', carrierCode: 'carrier-1', authData: { tokenType: 'access', principalId }, assignment });
(async () => {
    carrier = { code: 'carrier-1', activeAction: { code: 'approve-refund', assigneePrincipalId: 'approver-1', assignmentVersion: 2, assignmentHistory: [] } };
    let delegated = await service.delegate(request('approver-1', { expectedActionCode: 'approve-refund', expectedAssignmentVersion: 2, assigneePrincipalId: 'approver-2', reasonCode: 'SHIFT_HANDOVER' }));
    assert.strictEqual(delegated.activeAction.assigneePrincipalId, 'approver-2'); assert.strictEqual(delegated.assignmentEvidence.assignmentVersion, 3);
    await assert.rejects(service.delegate(request('approver-2', { expectedAssignmentVersion: 2, assigneePrincipalId: 'approver-3' })), /Stale/);
    let taken = await service.takeover(request('supervisor-1', { expectedActionCode: 'approve-refund', expectedAssignmentVersion: 3, reasonCode: 'SLA_BREACH' }));
    assert.strictEqual(taken.activeAction.assigneePrincipalId, 'supervisor-1'); assert.strictEqual(taken.activeAction.assignmentHistory.length, 2);
    await assert.rejects(service.takeover(request('supervisor-2', { expectedAssignmentVersion: 4 })), /reason/);
    console.log('Workflow assignment contract validated');
})().catch(error => { console.error(error); process.exit(1); });
