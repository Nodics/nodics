/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/service/lifecycle/DefaultOrderReturnOutcomeService @description Converts normalized Fulfillment Return completion facts into Order-owned refund eligibility and final lifecycle state. @layer service @owner order @override Customers may replace disposition eligibility policy while retaining Order authority and Fulfillment references. */
module.exports = {
  /**
   * Initializes the module artifact within the order-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
  /**
   * Executes the error operation within the order-owned layered contract.
   *
   * @param {*} message Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  error: function (message) { let error = new Error(message); error.code = 'ERR_ORD_00072'; return error; },
  /**
   * Executes the data operation within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  data: function (request) { return request && (request.data || request.event && request.event.data) || {}; },
  /**
   * Executes the rows operation within the order-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  rows: function (value) { return value && Array.isArray(value.result) ? value.result : []; },
  /**
   * Executes the safe projection operation within the order-owned layered contract.
   *
   * @param {*} record Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  safeProjection: function (record) { let denied = new Set((((CONFIG.get('order') || {}).orderLifecycle || {}).returnCompletion || {}).nonRefundableDispositionCodes || ['MISSING']); return { returnCode: record.returnCode, status: record.status, dispositionCode: record.dispositionCode, requestedQuantity: record.requestedQuantity, receivedQuantity: record.receivedQuantity, refundPolicyCode: record.refundPolicyCode, inventoryDispositionStatus: record.inventoryDispositionEvidence && record.inventoryDispositionEvidence.status, eligible: record.status === 'CLOSED' && !denied.has(record.dispositionCode) && record.receivedQuantity !== '0' }; },
  /**
   * Executes the context operation within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  context: async function (request) { let data = this.data(request); if (!request.tenant || !data.orderLifecycleRequestCode || !data.enterpriseCode) throw this.error('Return outcome identity is incomplete'); let owner = SERVICE.DefaultOrderLifecycleOrchestrationService, lifecycle = await owner.loadRequest(request, { requestCode: data.orderLifecycleRequestCode, entCode: data.enterpriseCode }); if (!lifecycle || lifecycle.requestType !== 'RETURN') throw this.error('Order Return lifecycle request is unavailable'); let response = await SERVICE.DefaultFulfillmentReturnRequestService.get({ tenant: request.tenant, authData: request.authData, query: { orderLifecycleRequestCode: lifecycle.requestCode, enterpriseCode: lifecycle.entCode }, searchOptions: { limit: Number((((CONFIG.get('order') || {}).orderLifecycle || {}).maximumItemsPerRequest || 100) + 1) } }); let returns = this.rows(response); if (!returns.length) throw this.error('Fulfillment Return outcomes are unavailable'); return { lifecycle, returns }; },
  /**
   * Handles closed within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleClosed: async function (request) { let context = await this.context(request); if (context.lifecycle.state === 'COMPLETED') return { requestCode: context.lifecycle.requestCode, state: 'COMPLETED', idempotent: true }; if (context.lifecycle.state !== 'PARTIALLY_COMPLETED') throw this.error('Order Return is not awaiting Fulfillment outcomes'); let projections = context.returns.map(record => this.safeProjection(record)), pending = projections.some(record => !['CLOSED', 'CANCELLED', 'FAILED'].includes(record.status)); if (pending) return { requestCode: context.lifecycle.requestCode, state: context.lifecycle.state, pending: true }; let failed = projections.some(record => record.status !== 'CLOSED'), eligible = !failed && projections.some(record => record.eligible); let state = failed ? 'RECONCILIATION_REQUIRED' : 'COMPLETED', updated = await SERVICE.DefaultOrderLifecycleOrchestrationService.updateState(request, context.lifecycle, ['PARTIALLY_COMPLETED'], { state, evidence: Object.assign({}, context.lifecycle.evidence, { returnOutcomes: projections, refundEligibility: { eligible, policyCodes: [...new Set(projections.map(record => record.refundPolicyCode).filter(Boolean))], evaluatedAt: new Date() }, completedAt: state === 'COMPLETED' ? new Date() : undefined }) }, false); if (SERVICE.DefaultOrderLifecycleAuditService) await SERVICE.DefaultOrderLifecycleAuditService.record(request, updated, state === 'COMPLETED' ? 'RETURN_COMPLETED' : 'RETURN_RECONCILIATION_REQUIRED', updated.version, state === 'COMPLETED' ? 'Return receipt and disposition completed' : 'Return outcome requires reconciliation'); return { requestCode: updated.requestCode, state: updated.state, refundEligibility: updated.evidence.refundEligibility }; },
  /**
   * Handles failure within the order-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handleFailure: async function (request) { return this.handleClosed(request); },
};
