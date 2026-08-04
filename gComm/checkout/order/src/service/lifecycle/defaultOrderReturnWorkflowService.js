/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @module order/service/lifecycle/DefaultOrderReturnWorkflowService
 * @description Runs return validation and authorization in Workflow, then delegates creation of Fulfillment-owned RMA evidence.
 * @layer service
 * @owner order
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    config: function () { return ((CONFIG.get('order') || {}).orderLifecycle) || {}; },
    error: function (message, code) { if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00060'); let error = new Error(message); error.code = code || 'ERR_ORD_00060'; return error; },
    source: function (request) { let carrier = request.workflowCarrier || {}; let source = carrier.sourceDetail || {}; if (!carrier.code || source.processType !== 'orderLifecycleRequest' || source.requestType !== 'RETURN' || !source.requestCode || !source.entCode || !source.orderCode || !Number.isInteger(Number(source.requestVersion))) throw this.error('Return Workflow carrier source is incomplete'); return { carrier: carrier, source: source }; },
    success: function (decision, action, feedback) { return { decision: decision, type: decision === 'REJECT' ? 'REJECTED' : 'SUCCESS', feedback: Object.assign({ action: action }, feedback || {}) }; },
    aggregate: async function (request, source) { let service = SERVICE.DefaultOrderLifecycleOrchestrationService; if (!service) throw this.error('Order lifecycle orchestration is unavailable'); let current = await service.loadRequest(request, { requestCode: source.requestCode, entCode: source.entCode }); if (!current || current.orderCode !== source.orderCode || current.requestType !== 'RETURN' || Number(current.version) !== Number(source.requestVersion)) throw this.error('Return Workflow request version is stale', 'ERR_ORD_00061'); return { request: current, items: await service.loadItems(request, current.requestCode) }; },
    update: function (request, current, states, patch) { return SERVICE.DefaultOrderLifecycleOrchestrationService.updateState(request, current, states, patch, false); },
    approvalActor: function (request, model) { let policy = ((this.config().workflow || {}).approval) || {}; let auth = request.authData || {}; let actorCode = auth.principalId || auth.code || auth.username; if (!actorCode || !(policy.manualApproverTokenTypes || ['access']).includes(auth.tokenType)) throw this.error('Return approval requires an authorized human principal', 'ERR_ORD_00061'); if (policy.makerCheckerRequired !== false && actorCode === model.requesterCode) throw this.error('Return requester cannot approve the same request', 'ERR_ORD_00061'); return { actorCode: actorCode, actorType: 'EMPLOYEE', tokenType: auth.tokenType }; },
    align: function (left, right) { let exact = SERVICE.DefaultExactUnitsService; if (!exact || typeof exact.parse !== 'function') throw this.error('Return authorization requires Units exact arithmetic'); let a = exact.parse(left), b = exact.parse(right), scale = Math.max(a.scale, b.scale); return { left: a.unscaled * 10n ** BigInt(scale - a.scale), right: b.unscaled * 10n ** BigInt(scale - b.scale), scale: scale, format: exact.format.bind(exact) }; },
    itemDecisions: function (request, items, route) { let supplied = [].concat(((request.workflowDecision || {}).items) || []), byCode = new Map(supplied.map(value => [value.requestItemCode, value])); if (supplied.length && supplied.length !== byCode.size) throw this.error('Return authorization contains duplicate item decisions'); return items.map(item => { let decision = byCode.get(item.requestItemCode); if (supplied.length && !decision) throw this.error('Return authorization must decide every request item'); let approved = decision ? decision.approvedQuantity : item.requestedQuantity, rejected = decision && decision.rejectedQuantity !== undefined ? decision.rejectedQuantity : '0'; let a = this.align(approved, rejected), requested = this.align(item.requestedQuantity, a.format(a.left + a.right, a.scale)); if (a.left < 0n || a.right < 0n || requested.left !== requested.right) throw this.error('Return approved and rejected quantities must exactly equal requested quantity'); if (route === 'AUTO_APPROVE' && a.left !== requested.left) throw this.error('Automatic Return authorization cannot partially reject quantities'); return { item: item, approvedQuantity: approved, rejectedQuantity: rejected, decisionReasonCode: decision && decision.decisionReasonCode, state: a.left === 0n ? 'REJECTED' : a.right === 0n ? 'AUTHORIZED' : 'PARTIALLY_AUTHORIZED' }; }); },
    evaluate: async function (request) {
        let context = this.source(request); let aggregate = await this.aggregate(request, context.source);
        if (aggregate.request.state === 'AUTHORIZATION_PENDING' && aggregate.request.evidence && aggregate.request.evidence.authorizationRoute) return this.success(aggregate.request.evidence.authorizationRoute, 'evaluate', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, idempotent: true });
        if (aggregate.request.state !== 'SUBMITTED') throw this.error('Return Workflow request is not ready for evaluation', 'ERR_ORD_00061');
        if (!SERVICE.DefaultPipelineService) throw this.error('Return Workflow pipeline service is unavailable');
        let items = aggregate.items.map(item => ({ orderEntryCode: item.orderEntryCode, unitCode: item.unitCode, requestedQuantity: item.requestedQuantity, immutableEvidence: item.immutableEvidence }));
        let validation = await SERVICE.DefaultPipelineService.start(this.config().returnValidation.pipelineName, Object.assign({}, request, { returnValidation: { entCode: aggregate.request.entCode, orderCode: aggregate.request.orderCode, items: items, ownerEvidence: request.ownerEvidence } }), {});
        let authorization = validation && validation.eligible === true ? await SERVICE.DefaultPipelineService.start(this.config().returnAuthorization.pipelineName, Object.assign({}, request, { returnAuthorization: { request: aggregate.request, validation: validation } }), {}) : { route: 'REJECT' };
        let evidence = { requestVersion: aggregate.request.version, returnValidation: validation, authorizationRoute: authorization.route, workflowCarrierCode: context.carrier.code };
        let pending = await this.update(request, aggregate.request, ['SUBMITTED'], { state: 'AUTHORIZATION_PENDING', evidence: evidence });
        if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, pending, 'RETURN_EVALUATED', authorization.route, 'Return evaluated for ' + authorization.route);
        return this.success(authorization.route, 'evaluate', { requestCode: pending.requestCode, requestVersion: pending.version, validation: validation });
    },
    authorize: async function (request) {
        let context = this.source(request); let aggregate = await this.aggregate(request, context.source);
        if (aggregate.request.state === 'AUTHORIZED') return this.success('SUCCESS', 'authorize', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, idempotent: true });
        let route = (aggregate.request.evidence || {}).authorizationRoute; if (!['AUTO_APPROVE', 'MANUAL_REVIEW'].includes(route)) throw this.error('Return authorization lacks eligible decision evidence', 'ERR_ORD_00061');
        let actor = route === 'MANUAL_REVIEW' ? this.approvalActor(request, aggregate.request) : { actorCode: 'WORKFLOW_POLICY', actorType: 'SYSTEM' };
        let itemDecisions = this.itemDecisions(request, aggregate.items, route);
        let partial = itemDecisions.some(value => value.state === 'PARTIALLY_AUTHORIZED' || value.state === 'REJECTED');
        let decisionEvidence = itemDecisions.map(value => ({ requestItemCode: value.item.requestItemCode, approvedQuantity: value.approvedQuantity, rejectedQuantity: value.rejectedQuantity, decisionReasonCode: value.decisionReasonCode, state: value.state }));
        let authorized = await SERVICE.DefaultOrderLifecycleOrchestrationService.updateDecisionAggregate(request, aggregate.request, ['AUTHORIZATION_PENDING'], decisionEvidence, { state: 'AUTHORIZED', evidence: Object.assign({}, aggregate.request.evidence, { authorizationDecision: partial ? 'PARTIALLY_AUTHORIZED' : 'AUTHORIZED', authorizationActor: actor, authorizedAt: new Date(), itemDecisions: decisionEvidence }) });
        itemDecisions.forEach(value => Object.assign(value.item, { approvedQuantity: value.approvedQuantity, rejectedQuantity: value.rejectedQuantity, decisionReasonCode: value.decisionReasonCode, state: value.state }));
        if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, authorized, 'RETURN_AUTHORIZED', authorized.version, 'Return authorized');
        return this.success('SUCCESS', 'authorize', { requestCode: authorized.requestCode, requestVersion: authorized.version });
    },
    createRma: async function (request) {
        let context = this.source(request); let aggregate = await this.aggregate(request, context.source);
        if (aggregate.request.state === 'COMPLETED') return this.success('SUCCESS', 'createRma', { requestCode: aggregate.request.requestCode, idempotent: true });
        if (aggregate.request.state !== 'AUTHORIZED') throw this.error('Return Workflow request is not authorized', 'ERR_ORD_00061');
        if (!SERVICE.DefaultReturnRequestService || typeof SERVICE.DefaultReturnRequestService.requestReturn !== 'function') throw this.error('Fulfillment return owner service is unavailable');
        let results = [];
        for (let item of aggregate.items) { let quantity = item.approvedQuantity === undefined ? item.requestedQuantity : item.approvedQuantity; if (this.align(quantity, '0').left === 0n) continue; results.push(await SERVICE.DefaultReturnRequestService.requestReturn({ tenant: request.tenant, authData: request.authData, idempotencyKey: [aggregate.request.requestCode, aggregate.request.version, item.requestItemCode].join('::'), orderCode: aggregate.request.orderCode, returnReasonCode: aggregate.request.reasonCode, returnType: 'CUSTOMER_RETURN', itemCodes: [item.orderEntryCode], requestedQuantity: quantity, allocationCodes: (item.immutableEvidence || {}).allocationReferences || [] })); }
        let completed = await this.update(request, aggregate.request, ['AUTHORIZED'], { state: 'COMPLETED', evidence: Object.assign({}, aggregate.request.evidence, { fulfillmentReturns: results.map(value => ({ returnCode: value.returnCode, status: value.status, idempotent: value.idempotent === true })), completedAt: new Date() }) });
        if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, completed, 'RETURN_RMA_CREATED', completed.version, 'Fulfillment return requests created');
        return this.success('SUCCESS', 'createRma', { requestCode: completed.requestCode, requestVersion: completed.version, returns: results });
    },
    reject: async function (request) { let context = this.source(request); let aggregate = await this.aggregate(request, context.source); if (aggregate.request.state === 'REJECTED') return this.success('REJECT', 'reject', { requestCode: aggregate.request.requestCode, idempotent: true }); let rejected = await this.update(request, aggregate.request, ['AUTHORIZATION_PENDING'], { state: 'REJECTED', evidence: Object.assign({}, aggregate.request.evidence || {}, { authorizationDecision: 'REJECTED', rejectedAt: new Date() }) }); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, rejected, 'RETURN_REJECTED', rejected.version, 'Return rejected'); return this.success('REJECT', 'reject', { requestCode: rejected.requestCode, requestVersion: rejected.version }); },
};
