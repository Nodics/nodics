/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module payment/service/refund/DefaultPaymentRefundOutcomeService @description Applies a provider-adapter-verified normalized refund callback with replay and optimistic concurrency protection. @layer service @owner payment @override Provider modules verify signatures and map vendor payloads before calling this stable service. */
module.exports = {
  /**
   * Initializes the module artifact within the paymentCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
  /**
   * Executes the error operation within the paymentCore-owned layered contract.
   *
   * @param {*} message Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  error: function (message) { let error = new Error(message); error.code = 'ERR_PAY_00018'; return error; },
  /**
   * Executes the items operation within the paymentCore-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  items: function (value) { return value && Array.isArray(value.result) ? value.result : []; },
  /**
   * Handles the module artifact within the paymentCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  handle: async function (request) { let input = request && (request.refundOutcome || request.body) || {}, auth = request && request.authData || {}; if (!request || !request.tenant || auth.tokenType !== 'service' || !input.signatureVerified || !input.providerEventCode || !input.transactionCode || !input.providerCode || !['REFUNDED', 'FAILED'].includes(input.status)) throw this.error('Verified normalized refund outcome identity is required'); if (/payload|secret|credential|token|pan|cvv/i.test(JSON.stringify(input))) throw this.error('Refund outcome contains prohibited provider data'); let replay = this.items(await SERVICE.DefaultPaymentTransactionService.get({ tenant: request.tenant, authData: request.authData, query: { providerEventCode: input.providerEventCode }, searchOptions: { limit: 2 } })); if (replay.length > 1) throw this.error('Refund outcome replay identity is ambiguous'); if (replay.length) return Object.assign({ idempotent: true }, replay[0]); let records = this.items(await SERVICE.DefaultPaymentTransactionService.get({ tenant: request.tenant, authData: request.authData, query: { transactionCode: input.transactionCode, providerCode: input.providerCode }, searchOptions: { limit: 2 } })); if (records.length !== 1 || records[0].operation !== 'REFUND') throw this.error('Refund transaction is unavailable'); let current = records[0], patch = { status: input.status, providerTransactionRef: input.providerTransactionRef || current.providerTransactionRef, providerEventCode: input.providerEventCode, recoveryAction: 'PROVIDER_CALLBACK_RECONCILIATION', recoveryStatus: input.status === 'REFUNDED' ? 'RECOVERED' : 'FAILED', failureCode: input.failureCode, completedAt: input.occurredAt || new Date(), revision: Number(current.revision || 0) + 1 }; let response = await SERVICE.DefaultPaymentTransactionService.update({ tenant: request.tenant, authData: request.authData, query: { transactionCode: current.transactionCode, status: { $in: ['REQUESTED', 'RECONCILIATION_REQUIRED'] }, revision: Number(current.revision || 0) }, model: patch }), affected = Number(response && (response.modifiedCount !== undefined ? response.modifiedCount : response.result && response.result.modifiedCount) || 0); if (affected !== 1) throw this.error('Refund outcome revision conflict'); let result = Object.assign({}, current, patch); if (SERVICE.DefaultPaymentRefundEventService) await SERVICE.DefaultPaymentRefundEventService.publish(request, result, 'PROVIDER_CALLBACK_RECONCILED'); return result; },
};
