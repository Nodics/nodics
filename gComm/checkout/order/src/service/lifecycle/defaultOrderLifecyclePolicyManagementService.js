/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/service/lifecycle/DefaultOrderLifecyclePolicyManagementService @description Governs lifecycle Policy and Reason mutation with optimistic versioning and maker-checker activation. @layer service @owner order */
module.exports = {
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00071'; return error; },
    actor: function (request) { let auth = request.authData || {}, actor = auth.principalId || auth.employeeCode; if (!request.tenant || auth.tokenType !== 'access' || !actor) throw this.error('Lifecycle policy management requires employee identity'); return String(actor); },
    input: function (request) { let body = request.body || request.policyManagement || {}, model = body.model && typeof body.model === 'object' ? body.model : {}; return Object.assign({}, model, body); },
    prohibited: function (value) { let text = JSON.stringify(value || {}); if (text.length > 16000) throw this.error('Lifecycle policy payload exceeds bound'); if (/(secret|password|token|credential|providerPayload|rawPayload)/i.test(text)) throw this.error('Lifecycle policy contains prohibited data'); },
    manage: async function (request, kind) { let actor = this.actor(request), input = this.input(request), service = SERVICE[kind === 'POLICY' ? 'DefaultOrderLifecyclePolicyRuleService' : 'DefaultOrderLifecycleReasonService'], codeField = kind === 'POLICY' ? 'policyCode' : 'reasonCode', code = String(input[codeField] || ''), action = String(input.action || 'UPDATE'); if (!service || !code || !input.entCode) throw this.error('Lifecycle policy identity is required'); this.prohibited(input); let result = await service.get({ tenant: request.tenant, authData: request.authData, query: { entCode: input.entCode, [codeField]: code }, searchOptions: { limit: 1 } }), current = result && result.result && result.result[0]; if (!current) throw this.error('Lifecycle policy record is unavailable'); if (Number(input.expectedVersion) !== Number(current.version)) throw this.error('Lifecycle policy version is stale'); let model = {};
        if (action === 'UPDATE') { if (current.status === 'RETIRED') throw this.error('Retired lifecycle policy is immutable'); if (kind === 'POLICY') { if (input.scope === undefined && input.rule === undefined) throw this.error('Policy update requires scope or rule'); if (input.scope !== undefined) model.scope = input.scope; if (input.rule !== undefined) model.rule = input.rule; } else { ['label', 'requestTypes', 'requestedOutcomes', 'requiredEvidence'].forEach(field => { if (input[field] !== undefined) model[field] = input[field]; }); if (!Object.keys(model).length) throw this.error('Reason update requires governed fields'); } model.status = 'DRAFT'; }
        else if (action === 'ACTIVATE') { if (current.updatedByPrincipalId && current.updatedByPrincipalId === actor) throw this.error('Lifecycle policy maker cannot activate the same revision'); model.status = 'ACTIVE'; model.approvalEvidence = { approvedByPrincipalId: actor, reasonCode: String(input.approvalReasonCode || input.reasonCode || 'POLICY_APPROVED').slice(0, 100), approvedAt: new Date() }; }
        else if (action === 'SUSPEND') { model.status = 'SUSPENDED'; model.approvalEvidence = { approvedByPrincipalId: actor, reasonCode: String(input.approvalReasonCode || input.reasonCode || 'POLICY_SUSPENDED').slice(0, 100), approvedAt: new Date() }; }
        else throw this.error('Unsupported lifecycle policy action'); model.version = Number(current.version) + 1; model.updatedByPrincipalId = actor;
        let saved = await service.update({ tenant: request.tenant, authData: request.authData, query: { entCode: input.entCode, [codeField]: code, version: current.version }, model, _orderLifecyclePolicyMutationAuthorized: true }); return { kind, code, action, version: model.version, status: model.status, result: saved && saved.result || saved }; },
    managePolicy: function (request) { return this.manage(request, 'POLICY'); }, manageReason: function (request) { return this.manage(request, 'REASON'); },
    authorizeSeed: function (request) { if (request && request._orderLifecyclePolicyMutationAuthorized === true || request && request.authData && request.authData.tokenType === 'service' && request.model && request.model.status === 'DRAFT') return Promise.resolve(request); return Promise.reject(this.error('Lifecycle policy creation requires governed service seed')); }, authorizeMutation: function (request) { if (request && request._orderLifecyclePolicyMutationAuthorized === true) return Promise.resolve(request); return Promise.reject(this.error('Direct lifecycle policy persistence is prohibited')); }, rejectHardDelete: function () { return Promise.reject(this.error('Lifecycle policy and reason history cannot be deleted')); },
};
