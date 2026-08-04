/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/service/lifecycle/DefaultOrderRefundWorkflowService @description Owns Refund calculation, approval, Payment execution, failure, and reconciliation state orchestration. @layer service @owner order */
module.exports = {
    /**
     * Initializes the module artifact within the order-owned layered contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, config: function () { return ((CONFIG.get('order') || {}).orderLifecycle) || {}; },
    /**
     * Executes the error operation within the order-owned layered contract.
     *
     * @param {*} message Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00065'; return error; },
    /**
     * Executes the source operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    source: function (request) { let carrier = request.workflowCarrier || {}, source = carrier.sourceDetail || {}; if (!carrier.code || source.processType !== 'orderLifecycleRequest' || source.requestType !== 'REFUND' || !source.requestCode || !source.entCode || !source.orderCode || !Number.isInteger(Number(source.requestVersion))) throw this.error('Refund Workflow carrier source is incomplete'); return { carrier: carrier, source: source }; },
    /**
     * Executes the success operation within the order-owned layered contract.
     *
     * @param {*} decision Value defined by the surrounding Nodics operation contract.
     * @param {*} action Value defined by the surrounding Nodics operation contract.
     * @param {*} feedback Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    success: function (decision, action, feedback) { return { decision: decision, type: decision === 'REJECT' ? 'REJECTED' : 'SUCCESS', feedback: Object.assign({ action: action }, feedback || {}) }; },
    /**
     * Executes the aggregate operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} source Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    aggregate: async function (request, source) { let owner = SERVICE.DefaultOrderLifecycleOrchestrationService; let current = await owner.loadRequest(request, { requestCode: source.requestCode, entCode: source.entCode }); if (!current || current.requestType !== 'REFUND' || current.orderCode !== source.orderCode || Number(current.version) !== Number(source.requestVersion)) throw this.error('Refund Workflow request version is stale'); return { request: current, items: await owner.loadItems(request, current.requestCode) }; },
    /**
     * Updates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} current Value defined by the surrounding Nodics operation contract.
     * @param {*} states Value defined by the surrounding Nodics operation contract.
     * @param {*} patch Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    update: function (request, current, states, patch) { return SERVICE.DefaultOrderLifecycleOrchestrationService.updateState(request, current, states, patch, false); },
    /**
     * Executes the actor operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @param {*} model Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    actor: function (request, model) { let policy = ((this.config().workflow || {}).approval) || {}, auth = request.authData || {}, code = auth.principalId || auth.code; if (!code || !(policy.manualApproverTokenTypes || ['access']).includes(auth.tokenType)) throw this.error('Refund approval requires an authorized human principal'); if (policy.makerCheckerRequired !== false && code === model.requesterCode) throw this.error('Refund requester cannot approve the same request'); return { actorCode: code, actorType: 'EMPLOYEE', tokenType: auth.tokenType }; },
    /**
     * Evaluates the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    evaluate: async function (request) { let context = this.source(request), aggregate = await this.aggregate(request, context.source); if (aggregate.request.state === 'APPROVAL_PENDING' && (aggregate.request.evidence || {}).approvalRoute) return this.success(aggregate.request.evidence.approvalRoute, 'evaluate', { requestCode: aggregate.request.requestCode, idempotent: true }); if (aggregate.request.state !== 'SUBMITTED') throw this.error('Refund request is not ready for evaluation'); let calculation = await SERVICE.DefaultPipelineService.start(this.config().refundCalculation.pipelineName, Object.assign({}, request, { refundCalculation: { request: aggregate.request, items: aggregate.items, orderEntries: request.orderEntries, paymentAllocations: request.paymentAllocations, paymentTransactions: request.paymentTransactions } }), {}); let approval = await SERVICE.DefaultPipelineService.start(this.config().refundApproval.pipelineName, Object.assign({}, request, { refundApproval: { request: aggregate.request, calculation: calculation, riskEvidence: request.riskEvidence } }), {}); let evidence = { requestVersion: aggregate.request.version, calculation: calculation, approvalRoute: approval.route, riskEvidence: approval.riskEvidence, workflowCarrierCode: context.carrier.code }; let pending = await this.update(request, aggregate.request, ['SUBMITTED'], { state: 'APPROVAL_PENDING', evidence: evidence }); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, pending, 'REFUND_EVALUATED', approval.route, 'Refund evaluated'); return this.success(approval.route, 'evaluate', { requestCode: pending.requestCode, calculation: calculation }); },
    /**
     * Executes the approve operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    approve: async function (request) { let context = this.source(request), aggregate = await this.aggregate(request, context.source); if (aggregate.request.state === 'APPROVED') return this.success('SUCCESS', 'approve', { requestCode: aggregate.request.requestCode, idempotent: true }); let route = (aggregate.request.evidence || {}).approvalRoute; if (!['AUTO_APPROVE', 'MANUAL_REVIEW'].includes(route)) throw this.error('Refund approval lacks bound evidence'); let actor = route === 'MANUAL_REVIEW' ? this.actor(request, aggregate.request) : { actorCode: 'WORKFLOW_POLICY', actorType: 'SYSTEM' }; let approved = await this.update(request, aggregate.request, ['APPROVAL_PENDING'], { state: 'APPROVED', evidence: Object.assign({}, aggregate.request.evidence, { approvalDecision: 'APPROVED', approvalActor: actor, approvedAt: new Date() }) }); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, approved, 'REFUND_APPROVED', approved.version, 'Refund approved'); return this.success('SUCCESS', 'approve', { requestCode: approved.requestCode }); },
    /**
     * Executes the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    execute: async function (request) { let context = this.source(request), aggregate = await this.aggregate(request, context.source); if (aggregate.request.state === 'COMPLETED') return this.success('SUCCESS', 'execute', { requestCode: aggregate.request.requestCode, idempotent: true }); if (!['APPROVED', 'EXECUTING'].includes(aggregate.request.state)) throw this.error('Refund request is not approved for execution'); let executing = aggregate.request.state === 'APPROVED' ? await this.update(request, aggregate.request, ['APPROVED'], { state: 'EXECUTING' }) : aggregate.request; try { let result = await SERVICE.DefaultPipelineService.start(this.config().refundExecution.pipelineName, Object.assign({}, request, { refundExecution: { request: Object.assign({}, executing, { state: 'APPROVED' }), items: aggregate.items } }), {}); let completed = await this.update(request, executing, ['EXECUTING'], { state: 'COMPLETED', evidence: Object.assign({}, executing.evidence, { productLifecycleExecution: result.productLifecycle, paymentExecution: result.payment || result, completedAt: new Date() }) }); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, completed, 'REFUND_EXECUTED', completed.version, 'Refund executed'); return this.success('SUCCESS', 'execute', { requestCode: completed.requestCode, result: result }); } catch (error) { let failed = await this.update(request, executing, ['EXECUTING'], { state: 'RECONCILIATION_REQUIRED', evidence: Object.assign({}, executing.evidence, { failureCode: error.code || 'ERR_ORD_00065', failedAt: new Date() }) }); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, failed, 'REFUND_RECONCILIATION_REQUIRED', failed.version, 'Refund execution requires reconciliation'); throw error; } },
    /**
     * Executes the reconcile operation within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    reconcile: async function (request) { let context = this.source(request), aggregate = await this.aggregate(request, context.source); if (aggregate.request.state === 'COMPLETED') return this.success('SUCCESS', 'reconcile', { requestCode: aggregate.request.requestCode, idempotent: true }); if (aggregate.request.state !== 'RECONCILIATION_REQUIRED') throw this.error('Refund request is not awaiting reconciliation'); let expected = [].concat((((aggregate.request.evidence || {}).calculation || {}).paymentCalculation || {}).allocationEvidence || []); if (!expected.length || !SERVICE.DefaultPaymentTransactionService) throw this.error('Refund reconciliation allocation authority is unavailable'); let result = await SERVICE.DefaultPaymentTransactionService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: aggregate.request.entCode, refundCode: aggregate.request.requestCode, operation: 'REFUND' }, searchOptions: { limit: expected.length + 1 } }), transactions = result && result.result || []; if (transactions.length !== expected.length) throw this.error('Refund reconciliation evidence is incomplete'); let byParent = new Map(transactions.map(transaction => [transaction.parentTransactionCode, transaction])); expected.forEach(allocation => { let transaction = byParent.get(allocation.originalTransactionCode); if (!transaction || transaction.status !== 'REFUNDED' || transaction.amount !== allocation.amount || transaction.currencyCode !== allocation.currencyCode || transaction.providerCode !== allocation.providerCode || transaction.paymentModeCode !== allocation.paymentModeCode) throw this.error('Refund reconciliation evidence does not match approved original-rail allocation'); }); let completed = await this.update(request, aggregate.request, ['RECONCILIATION_REQUIRED'], { state: 'COMPLETED', evidence: Object.assign({}, aggregate.request.evidence, { paymentExecution: { transactions: transactions.map(transaction => ({ transactionCode: transaction.transactionCode, parentTransactionCode: transaction.parentTransactionCode, providerCode: transaction.providerCode, paymentModeCode: transaction.paymentModeCode, amount: transaction.amount, currencyCode: transaction.currencyCode, status: transaction.status, providerTransactionRef: transaction.providerTransactionRef })) }, reconciledAt: new Date() }) }); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, completed, 'REFUND_EXECUTED', completed.version, 'Refund provider outcome reconciled'); return this.success('SUCCESS', 'reconcile', { requestCode: completed.requestCode, transactions: transactions.length }); },
    /**
     * Rejects the module artifact within the order-owned layered contract.
     *
     * @param {*} request Value defined by the surrounding Nodics operation contract.
     * @returns {*} The synchronous value or Promise produced by the implementation.
     * @throws Propagates validation, authorization, persistence, or delegated service failures.
     * @override Later project or customer modules may override this exported extension point.
     */
    reject: async function (request) { let context = this.source(request), aggregate = await this.aggregate(request, context.source); if (aggregate.request.state === 'REJECTED') return this.success('REJECT', 'reject', { requestCode: aggregate.request.requestCode, idempotent: true }); let rejected = await this.update(request, aggregate.request, ['APPROVAL_PENDING'], { state: 'REJECTED', evidence: Object.assign({}, aggregate.request.evidence || {}, { approvalDecision: 'REJECTED', rejectedAt: new Date() }) }); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, rejected, 'REFUND_REJECTED', rejected.version, 'Refund rejected'); return this.success('REJECT', 'reject', { requestCode: rejected.requestCode }); },
};
