/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/service/DefaultKycReviewLifecycleService @description Owns permissioned optimistic review assignment, claim, escalation, maker-checker, decision, closure, and SLA evidence. @layer service @owner kycCore @override Later modules may replace queue and assignment policy while preserving Workflow delegation and persisted maker-checker evidence. */
const crypto = require('crypto');
const list = value => value && Array.isArray(value.result) ? value.result : Array.isArray(value) ? value : [];
const affected = value => Number(value && (value.modifiedCount !== undefined ? value.modifiedCount : value.nModified !== undefined ? value.nModified : value.n) || value && value.result && value.result.modifiedCount || 0);
const fail = (message, code) => Object.assign(new Error(message), { code });

module.exports = {
    init: () => Promise.resolve(true), postInit: () => Promise.resolve(true),
    /**
     * Executes the config operation within the kycCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    config: function () { return (CONFIG.get('kyc') || {}).workflows || {}; },
    /**
     * Executes the actor operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    actor: function (request) { const auth = request.authData || {}; const actor = auth.principalId || auth.loginId || auth.userId; if (!actor) throw fail('Authenticated reviewer identity is unavailable.', 'KYC_OPERATION_FORBIDDEN'); return actor; },
    /**
     * Authorizes the module artifact within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} action Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    authorize: function (request, action) { const permission = (this.config().reviewActionPermissions || {})[action]; const permissions = (request.authData || {}).permissions || []; if (!permission || !permissions.includes(permission)) throw fail('The reviewer is not authorized for this action.', 'KYC_OPERATION_FORBIDDEN'); return permission; },
    /**
     * Loads the module artifact within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    load: async function (request) { const values = list(await SERVICE.DefaultKycReviewTaskService.get({ tenant: request.tenant, authData: request.authData, query: { reviewTaskCode: request.reviewTaskCode, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode }, searchOptions: { limit: 2 } }, {})); if (values.length !== 1) throw fail('The scoped KYC review task was not found.', 'KYC_CASE_NOT_FOUND'); return values[0]; },
    /**
     * Executes the note operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} actor Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    note: function (request, actor) { if (!request.safeNote) return undefined; const config = this.config(); const value = String(request.safeNote).trim(); if (!value || value.length > Number(config.maximumSafeNoteLength || 1000)) throw fail('The safe review note is invalid.', 'KYC_EVIDENCE_REJECTED'); return { noteCode: `kyc-note-${crypto.randomUUID()}`, actorReference: actor, reasonCode: request.reasonCode, value, occurredAt: new Date() }; },
    /**
     * Executes the mutate operation within the kycCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    mutate: async function (request) {
        const action = String(request.action || '').toUpperCase(); const permission = this.authorize(request, action); const actor = this.actor(request); const task = await this.load(request); const note = this.note(request, actor); const notes = [...(task.safeNotes || []), ...(note ? [note] : [])];
        if (notes.length > Number(this.config().maximumSafeNotes || 20)) throw fail('The review note evidence limit was exceeded.', 'KYC_EVIDENCE_REJECTED');
        let patch = { safeNotes: notes, version: Number(task.version) + 1 }; let workflowOperation;
        if (['ASSIGN', 'REASSIGN'].includes(action)) { if (!request.targetReference) throw fail('A target reviewer is required.', 'KYC_INVALID_REQUEST'); patch.assignedTo = request.targetReference; patch.status = 'OPEN'; workflowOperation = 'delegateAction'; }
        else if (['CLAIM', 'TAKEOVER'].includes(action)) { patch.assignedTo = actor; patch.claimedAt = new Date(); patch.status = 'CLAIMED'; workflowOperation = action === 'TAKEOVER' ? 'takeoverAction' : undefined; }
        else if (action === 'ESCALATE') { patch.escalationLevel = Number(task.escalationLevel || 0) + 1; patch.status = 'ESCALATED'; patch.slaStatus = 'ESCALATED'; }
        else if (action === 'REQUEST_MORE_INFORMATION') { patch.status = 'WAITING_FOR_INFORMATION'; patch.requestedAction = action; }
        else if (action === 'REQUEST_CHECKER') { if (!request.requestedAction || !['APPROVE', 'REJECT', 'OVERRIDE', 'REJECTION_REVERSAL', 'HIGH_RISK_APPROVAL', 'POLICY_EXCEPTION'].includes(request.requestedAction)) throw fail('A governed checker action is required.', 'KYC_INVALID_REQUEST'); patch.makerReference = actor; patch.checkerReference = undefined; patch.requestedAction = request.requestedAction; patch.status = 'CHECKER_PENDING'; }
        else if (['APPROVE', 'REJECT', 'OVERRIDE', 'REJECTION_REVERSAL', 'HIGH_RISK_APPROVAL', 'POLICY_EXCEPTION'].includes(action)) { if (task.makerCheckerRequired && (task.status !== 'CHECKER_PENDING' || !task.makerReference || task.makerReference === actor || task.requestedAction !== action)) throw fail('A different persisted checker must complete this action.', 'KYC_MAKER_CHECKER_REQUIRED'); patch.checkerReference = actor; patch.completedAt = new Date(); patch.status = action === 'REJECT' ? 'CLOSED' : 'COMPLETED'; }
        else if (action === 'CLOSE') { patch.completedAt = new Date(); patch.status = 'CLOSED'; }
        else if (action === 'EXPIRE') { patch.completedAt = new Date(); patch.status = 'EXPIRED'; patch.slaStatus = 'BREACHED'; }
        else throw fail('Unsupported KYC review action.', 'KYC_INVALID_REQUEST');
        const updated = await SERVICE.DefaultKycReviewTaskService.update({ tenant: request.tenant, authData: request.authData, query: { reviewTaskCode: task.reviewTaskCode, version: task.version, status: task.status }, model: { $set: patch } });
        if (affected(updated) !== 1) throw fail('The KYC review task changed before the action completed.', 'KYC_STATE_CONFLICT');
        if (workflowOperation) { const workflow = SERVICE.DefaultWorkflowService && SERVICE.DefaultWorkflowService[workflowOperation]; if (typeof workflow !== 'function') throw fail('Workflow assignment operation is unavailable.', 'KYC_PROVIDER_UNAVAILABLE'); await workflow.call(SERVICE.DefaultWorkflowService, { tenant: request.tenant, authData: request.authData, carrierCode: task.caseCode, assignment: { targetReference: patch.assignedTo, reasonCode: request.reasonCode } }); }
        let decision;
        if (['APPROVE', 'REJECT', 'OVERRIDE', 'REJECTION_REVERSAL', 'HIGH_RISK_APPROVAL', 'POLICY_EXCEPTION', 'REQUEST_MORE_INFORMATION', 'ESCALATE', 'EXPIRE'].includes(action)) decision = await SERVICE.DefaultKycService.performCaseAction(Object.assign({}, request, { caseCode: task.caseCode, makerChecker: task.makerCheckerRequired ? { required: true, makerReference: task.makerReference, checkerReference: patch.checkerReference || actor } : undefined }));
        await SERVICE.DefaultKycAuditService.record(request, { tenantCode: task.tenantCode, enterpriseCode: task.enterpriseCode, caseCode: task.caseCode, subjectType: request.subjectType || 'UNKNOWN', subjectCodeHash: request.subjectCodeHash || 'review-task-scoped', operation: 'REVIEW_ACTIONED', actorReference: actor, permissionCode: permission, correlationId: `${request.correlationId || task.reviewTaskCode}:${action}:${task.version}`, outcome: action, safeEvidence: { reviewTaskCode: task.reviewTaskCode, previousStatus: task.status, status: patch.status, reasonCode: request.reasonCode } });
        return { reviewTaskCode: task.reviewTaskCode, caseCode: task.caseCode, action, status: patch.status, assignedTo: patch.assignedTo || task.assignedTo, makerReference: patch.makerReference || task.makerReference, checkerReference: patch.checkerReference, decision };
    }
};
