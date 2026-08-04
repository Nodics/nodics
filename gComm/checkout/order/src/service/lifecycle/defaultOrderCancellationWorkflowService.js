/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/lifecycle/DefaultOrderCancellationWorkflowService
 * @description Runs cancellation decision pipelines from Workflow and binds approval routing to immutable Order lifecycle request versions.
 * @layer service
 * @owner order
 * @override Projects may replace approval policy or Workflow actions while preserving pipeline use, version binding, maker-checker routing, and no execution side effects.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
    config: function () { return ((CONFIG.get('order') || {}).orderLifecycle) || {}; },
    error: function (message, code) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code || 'ERR_ORD_00051');
        let error = new Error(message); error.code = code || 'ERR_ORD_00051'; return error;
    },
    assertSafe: function (value) {
        let serialized = JSON.stringify(value || {});
        if (serialized.match(/cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|rawCarrier|carrierPayload|rawTaxPayload|rawPromotionPayload/i)) {
            throw this.error('Cancellation Workflow evidence contains prohibited raw or secret data');
        }
        let maximum = Number(((((this.config().workflow || {}).approval) || {}).maximumDecisionEvidenceBytes) || 262144);
        if (typeof Buffer !== 'undefined' && Buffer.byteLength(serialized, 'utf8') > maximum) throw this.error('Cancellation Workflow evidence exceeds configured size bounds');
    },
    source: function (request) {
        let carrier = request.workflowCarrier || {}; let source = carrier.sourceDetail || {};
        if (!carrier.code || source.processType !== 'orderLifecycleRequest' || source.requestType !== 'CANCELLATION' || !source.requestCode || !source.entCode || !source.orderCode || !Number.isInteger(Number(source.requestVersion))) {
            throw this.error('Cancellation Workflow carrier source is incomplete');
        }
        this.assertSafe(source); return { carrier: carrier, source: source };
    },
    success: function (decision, action, feedback) {
        return { decision: decision, type: decision === 'REJECT' ? 'REJECTED' : 'SUCCESS', feedback: Object.assign({ action: action }, feedback || {}) };
    },
    aggregate: async function (request, source) {
        let orchestration = SERVICE.DefaultOrderLifecycleOrchestrationService;
        if (!orchestration || typeof orchestration.loadRequest !== 'function' || typeof orchestration.loadItems !== 'function') throw this.error('Order lifecycle orchestration is unavailable');
        let current = await orchestration.loadRequest(request, { requestCode: source.requestCode, entCode: source.entCode });
        if (!current || current.orderCode !== source.orderCode || current.requestType !== 'CANCELLATION' || Number(current.version) !== Number(source.requestVersion)) throw this.error('Cancellation Workflow request version is stale', 'ERR_ORD_00052');
        return { request: current, items: await orchestration.loadItems(request, current.requestCode) };
    },
    order: async function (request, source) {
        if (request.order && request.order.code === source.orderCode) return request.order;
        if (!SERVICE.DefaultOrderService || typeof SERVICE.DefaultOrderService.get !== 'function') throw this.error('Cancellation Workflow Order evidence service is unavailable');
        let result = await SERVICE.DefaultOrderService.get({ tenant: request.tenant, authData: request.authData, query: { code: source.orderCode, entCode: source.entCode }, searchOptions: { limit: 2 } });
        let records = Array.isArray(result) ? result : result && (result.result || result.items) || [];
        if (records.length !== 1) throw this.error('Cancellation Workflow requires one Order evidence record');
        return records[0];
    },
    compareMoney: function (left, right) {
        let parse = value => {
            if (typeof value !== 'string' || !/^(0|[1-9]\d*)(\.\d+)?$/.test(value)) throw this.error('Approval amount must be an exact non-negative decimal string');
            let parts = value.split('.'); return { value: BigInt(parts.join('')), scale: (parts[1] || '').length };
        };
        let a = parse(left); let b = parse(right); let scale = Math.max(a.scale, b.scale);
        return a.value * 10n ** BigInt(scale - a.scale) <= b.value * 10n ** BigInt(scale - b.scale);
    },
    route: function (requestModel, calculation) {
        let policy = ((this.config().workflow || {}).approval) || {};
        if (policy.autoApprovalEnabled === true && (policy.autoApprovalRequesterTypes || []).includes(requestModel.requesterType) && this.compareMoney(calculation.amount, policy.autoApprovalMaximumAmount || '0')) return 'AUTO_APPROVE';
        return policy.defaultRoute || 'MANUAL_REVIEW';
    },
    approvalActor: function (request, requestModel) {
        let policy = ((this.config().workflow || {}).approval) || {}; let auth = request.authData || {};
        let actorCode = auth.principalId || auth.code || auth.username;
        if (!actorCode) throw this.error('Cancellation approval requires authenticated actor evidence', 'ERR_ORD_00052');
        if ((policy.manualApproverTokenTypes || ['access']).length && !(policy.manualApproverTokenTypes || ['access']).includes(auth.tokenType)) throw this.error('Cancellation manual approval requires an authorized human principal', 'ERR_ORD_00052');
        if (policy.makerCheckerRequired !== false && actorCode === requestModel.requesterCode) throw this.error('Cancellation requester cannot approve the same request', 'ERR_ORD_00052');
        return { actorCode: actorCode, actorType: 'EMPLOYEE', tokenType: auth.tokenType };
    },
    update: async function (request, current, expectedStates, patch) {
        return SERVICE.DefaultOrderLifecycleOrchestrationService.updateState(request, current, expectedStates, patch, false);
    },
    evaluate: async function (request) {
        let context = this.source(request); let aggregate = await this.aggregate(request, context.source);
        if (aggregate.request.state === 'APPROVAL_PENDING' && aggregate.request.evidence && aggregate.request.evidence.approvalRoute) {
            return this.success(aggregate.request.evidence.approvalRoute, 'evaluate', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, idempotent: true });
        }
        if (aggregate.request.state !== 'SUBMITTED') throw this.error('Cancellation Workflow request is not ready for evaluation', 'ERR_ORD_00052');
        if (!SERVICE.DefaultPipelineService || typeof SERVICE.DefaultPipelineService.start !== 'function') throw this.error('Cancellation Workflow pipeline service is unavailable');
        let order = await this.order(request, context.source);
        let eligibilityInput = {
            entCode: context.source.entCode, order: order,
            items: aggregate.items.map(item => ({
                orderEntryCode: item.orderEntryCode, unitCode: item.unitCode,
                requestedQuantity: item.requestedQuantity, serialNumbers: item.serialNumbers,
                immutableEvidence: item.immutableEvidence,
                alreadyCancelledQuantity: (item.immutableEvidence || {}).alreadyCancelledQuantity || '0',
            })),
            ownerEvidence: request.ownerEvidence,
            correlationId: context.carrier.code,
        };
        let eligibility = await SERVICE.DefaultPipelineService.start(this.config().cancellationEligibility.pipelineName, Object.assign({}, request, { cancellationEligibility: eligibilityInput }), {});
        if (!eligibility || eligibility.eligible !== true) {
            let rejectedEvidence = { requestVersion: aggregate.request.version, eligibility: eligibility, approvalRoute: 'REJECT', workflowCarrierCode: context.carrier.code };
            this.assertSafe(rejectedEvidence);
            await this.update(request, aggregate.request, ['SUBMITTED'], { state: 'APPROVAL_PENDING', evidence: rejectedEvidence });
            await SERVICE.DefaultOrderLifecycleAuditService.record(request, Object.assign({}, aggregate.request, { state: 'APPROVAL_PENDING', evidence: rejectedEvidence }), 'CANCELLATION_EVALUATED', 'REJECT', 'Cancellation eligibility rejected');
            return this.success('REJECT', 'evaluate', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, eligibility: eligibility });
        }
        let calculationInput = {
            entCode: context.source.entCode, orderCode: context.source.orderCode,
            idempotencyKey: [aggregate.request.idempotencyKey, aggregate.request.version, 'calculation'].join('::'),
            eligibility: eligibility, orderEntries: request.orderEntries, paymentAllocations: request.paymentAllocations,
        };
        let calculation = await SERVICE.DefaultPipelineService.start(this.config().cancellationCalculation.pipelineName, Object.assign({}, request, { cancellationCalculation: calculationInput }), {});
        let approvalRoute = this.route(aggregate.request, calculation);
        let evidence = { requestVersion: aggregate.request.version, eligibility: eligibility, calculation: calculation, approvalRoute: approvalRoute, workflowCarrierCode: context.carrier.code };
        this.assertSafe(evidence);
        await this.update(request, aggregate.request, ['SUBMITTED'], { state: 'APPROVAL_PENDING', evidence: evidence });
        await SERVICE.DefaultOrderLifecycleAuditService.record(request, Object.assign({}, aggregate.request, { state: 'APPROVAL_PENDING', evidence: evidence }), 'CANCELLATION_EVALUATED', approvalRoute, 'Cancellation evaluated for ' + approvalRoute);
        return this.success(approvalRoute, 'evaluate', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, eligibility: eligibility, calculation: calculation, approvalRoute: approvalRoute });
    },
    approve: async function (request) {
        let context = this.source(request); let aggregate = await this.aggregate(request, context.source);
        if (aggregate.request.state === 'APPROVED') return this.success('SUCCESS', 'approve', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, idempotent: true });
        if (!aggregate.request.evidence || !['AUTO_APPROVE', 'MANUAL_REVIEW'].includes(aggregate.request.evidence.approvalRoute)) throw this.error('Cancellation approval lacks bound decision evidence', 'ERR_ORD_00052');
        let approvalActor = aggregate.request.evidence.approvalRoute === 'MANUAL_REVIEW' ? this.approvalActor(request, aggregate.request) : { actorCode: 'WORKFLOW_POLICY', actorType: 'SYSTEM' };
        let approved = await this.update(request, aggregate.request, ['APPROVAL_PENDING'], { state: 'APPROVED', evidence: Object.assign({}, aggregate.request.evidence, { approvalDecision: 'APPROVED', approvalActor: approvalActor, approvedAt: new Date() }) });
        await SERVICE.DefaultOrderLifecycleAuditService.record(request, approved, 'CANCELLATION_APPROVED', approved.version, 'Cancellation approved');
        return this.success('SUCCESS', 'approve', { requestCode: approved.requestCode, requestVersion: approved.version, state: approved.state });
    },
    execute: async function (request) {
        let context = this.source(request); let aggregate = await this.aggregate(request, context.source);
        if (aggregate.request.state === 'COMPLETED') return this.success('SUCCESS', 'execute', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, idempotent: true });
        if (!['APPROVED', 'EXECUTING'].includes(aggregate.request.state)) throw this.error('Cancellation Workflow request is not approved for execution', 'ERR_ORD_00052');
        if (!SERVICE.DefaultPipelineService || typeof SERVICE.DefaultPipelineService.start !== 'function') throw this.error('Cancellation execution Pipeline is unavailable');
        try {
            let result = await SERVICE.DefaultPipelineService.start(this.config().cancellationExecution.pipelineName, Object.assign({}, request, { cancellationExecution: { request: aggregate.request, items: aggregate.items } }), {});
            let current = await SERVICE.DefaultOrderLifecycleOrchestrationService.loadRequest(request, { requestCode: aggregate.request.requestCode, entCode: aggregate.request.entCode });
            let completed = await this.update(request, current, ['EXECUTING'], { state: 'COMPLETED', evidence: Object.assign({}, current.evidence || {}, { execution: Object.assign({}, (current.evidence || {}).execution || {}, { currentStep: 'COMPLETED', completedAt: new Date() }) }) });
            return this.success('SUCCESS', 'execute', { requestCode: completed.requestCode, requestVersion: completed.version, state: completed.state, result: result });
        } catch (error) {
            let current = await SERVICE.DefaultOrderLifecycleOrchestrationService.loadRequest(request, { requestCode: aggregate.request.requestCode, entCode: aggregate.request.entCode });
            if (current && current.state === 'EXECUTING') {
                try { await this.update(request, current, ['EXECUTING'], { state: 'RECONCILIATION_REQUIRED', evidence: Object.assign({}, current.evidence || {}, { execution: Object.assign({}, (current.evidence || {}).execution || {}, { failureCode: error.code || 'ERR_ORD_00053', failedAt: new Date() }) }) }); } catch (ignored) { /* operator reconciliation uses immutable request identity */ }
            }
            throw error;
        }
    },
    reject: async function (request) {
        let context = this.source(request); let aggregate = await this.aggregate(request, context.source);
        if (aggregate.request.state === 'REJECTED') return this.success('REJECT', 'reject', { requestCode: aggregate.request.requestCode, requestVersion: aggregate.request.version, idempotent: true });
        let rejected = await this.update(request, aggregate.request, ['APPROVAL_PENDING'], { state: 'REJECTED', evidence: Object.assign({}, aggregate.request.evidence || {}, { approvalDecision: 'REJECTED', rejectionActor: { actorCode: (request.authData || {}).principalId || 'WORKFLOW_POLICY', actorType: (request.authData || {}).tokenType === 'access' ? 'EMPLOYEE' : 'SYSTEM' }, rejectedAt: new Date() }) });
        await SERVICE.DefaultOrderLifecycleAuditService.record(request, rejected, 'CANCELLATION_REJECTED', rejected.version, 'Cancellation rejected');
        return this.success('REJECT', 'reject', { requestCode: rejected.requestCode, requestVersion: rejected.version, state: rejected.state });
    },
};
