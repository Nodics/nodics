/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available Workflow assignment authority. */
/** @module workflow/service/workflow/DefaultWorkflowAssignmentService @description Performs permissioned optimistic delegation and takeover for active Workflow actions with append-only bounded evidence. @layer service @owner workflow */
module.exports = {
    /**
     * Executes the init operation within the flowCore-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes the error operation within the flowCore-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_WF_00031'; return error; },
    /**
     * Executes the principal operation within the flowCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    principal: function (request) { let auth = request.authData || {}; let value = auth.principalId || auth.userCode || auth.employeeCode; if (!request.tenant || auth.tokenType !== 'access' || !value) throw this.error('Workflow assignment requires authenticated employee identity'); return String(value); },
    /**
     * Executes the body operation within the flowCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    body: function (request) { return request.assignment || request.actionResponse || request.httpRequest && request.httpRequest.body || {}; },
    /**
     * Executes the load operation within the flowCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    load: async function (request) { let response = await SERVICE.DefaultWorkflowCarrierService.getByCode({ tenant: request.tenant, authData: request.authData, code: request.carrierCode }); let carrier = response && (response.result || response); if (!carrier || !carrier.activeAction) throw this.error('Workflow carrier or active action not found'); return carrier; },
    /**
     * Executes the mutate operation within the flowCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} operation Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    mutate: async function (request, operation) {
        let actor = this.principal(request), input = this.body(request), carrier = await this.load(request), action = carrier.activeAction, version = Number(action.assignmentVersion || 0);
        if (!Number.isInteger(Number(input.expectedAssignmentVersion)) || Number(input.expectedAssignmentVersion) !== version) throw this.error('Stale Workflow assignment version');
        if (input.expectedActionCode && input.expectedActionCode !== action.code) throw this.error('Stale Workflow active action');
        let target;
        if (operation === 'DELEGATE') { if (!action.assigneePrincipalId || action.assigneePrincipalId !== actor) throw this.error('Only the current assignee can delegate'); target = String(input.assigneePrincipalId || ''); if (!target || target === actor) throw this.error('Delegation requires a different target principal'); }
        else { target = actor; if (action.assigneePrincipalId === actor) throw this.error('Workflow action is already assigned to this principal'); if (!String(input.reasonCode || '').trim()) throw this.error('Takeover requires a bounded reason code'); }
        let evidence = { operation: operation, actionCode: action.code, fromPrincipalId: action.assigneePrincipalId, toPrincipalId: target, actorPrincipalId: actor, reasonCode: String(input.reasonCode || (operation === 'DELEGATE' ? 'DELEGATED' : '')).slice(0, 100), at: new Date(), assignmentVersion: version + 1 };
        action.assigneePrincipalId = target; action.assignmentVersion = version + 1; action.assignmentHistory = [].concat(action.assignmentHistory || [], [evidence]).slice(-100);
        let saved = await SERVICE.DefaultWorkflowCarrierService.save({ tenant: request.tenant, authData: request.authData, options: { recursive: true }, model: carrier });
        return { carrierCode: carrier.code || request.carrierCode, activeAction: (saved && saved.result || carrier).activeAction, assignmentEvidence: evidence };
    },
    /**
     * Executes the delegate operation within the flowCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    delegate: function (request) { return this.mutate(request, 'DELEGATE'); },
    /**
     * Executes the takeover operation within the flowCore-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    takeover: function (request) { return this.mutate(request, 'TAKEOVER'); },
};
