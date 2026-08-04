/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/cancellation/DefaultPaymentCancellationExecutionService
 * @description Executes approved cancellation reversals against original Payment-owned transaction evidence.
 * @layer service
 * @owner payment
 * @override Projects may replace reversal routing while preserving original-rail enforcement, exact money, idempotency, and safe evidence.
 */
module.exports = {
  /**
   * Initializes the module artifact within the paymentCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); },
  /**
   * Completes initialization for the module artifact within the paymentCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  postInit: function () { return Promise.resolve(true); },
  /**
   * Executes the error operation within the paymentCore-owned layered contract.
   *
   * @param {*} code Value defined by the surrounding Nodics operation contract.
   * @param {*} message Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  error: function (code, message) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError) return new CLASSES.NodicsError(message, null, code);
    let error = new Error(message); error.code = code; return error;
  },
  /**
   * Executes the items operation within the paymentCore-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  items: function (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.result)) return value.result;
    if (Array.isArray(value.items)) return value.items;
    return [value];
  },
  /**
   * Authorizes the module artifact within the paymentCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  authorize: function (request) {
    let auth = (request || {}).authData || {};
    if (!request || !request.tenant || auth.tokenType !== "service") throw this.error("ERR_PAY_00011", "Payment cancellation execution requires internal service authentication");
  },
  /**
   * Executes the unsafe operation within the paymentCore-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  unsafe: function (value) {
    return /cvv|cardNumber|pan|secret|password|rawGateway|gatewayPayload|providerPayload|apiKey|accessToken|refreshToken/i.test(JSON.stringify(value || {}));
  },
  /**
   * Executes the decimal operation within the paymentCore-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  decimal: function (value) {
    if (!SERVICE.DefaultPaymentPolicyService.validateMoney(value)) throw this.error("ERR_PAY_00011", "Payment cancellation amount must be an exact decimal string");
    let parts = String(value).split("."); return { digits: BigInt(parts[0] + (parts[1] || "")), scale: (parts[1] || "").length };
  },
  /**
   * Executes the units operation within the paymentCore-owned layered contract.
   *
   * @param {*} value Value defined by the surrounding Nodics operation contract.
   * @param {*} scale Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  units: function (value, scale) {
    let parsed = this.decimal(value); return parsed.digits * (10n ** BigInt(scale - parsed.scale));
  },
  /**
   * Executes the sum operation within the paymentCore-owned layered contract.
   *
   * @param {*} values Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  sum: function (values) {
    let scale = Math.max.apply(null, [0].concat(values.map(value => this.decimal(value).scale)));
    return { scale: scale, units: values.reduce((total, value) => total + this.units(value, scale), 0n) };
  },
  /**
   * Returns the module artifact within the paymentCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} query Value defined by the surrounding Nodics operation contract.
   * @param {*} limit Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  get: async function (request, query, limit) {
    let response = await SERVICE.DefaultPaymentTransactionService.get({ tenant: request.tenant, authData: request.authData, query: query, searchOptions: { limit: limit || 100 } });
    return this.items(response);
  },
  /**
   * Executes the original operation within the paymentCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} allocation Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  original: async function (request, allocation) {
    let values = await this.get(request, { enterpriseCode: request.body.enterpriseCode, transactionCode: allocation.originalTransactionCode }, 2);
    if (values.length !== 1) throw this.error("ERR_PAY_00012", "Payment cancellation requires one original transaction");
    let original = values[0];
    if (original.orderCode !== request.body.orderCode || original.paymentGroupCode !== allocation.paymentGroupCode) throw this.error("ERR_PAY_00012", "Payment cancellation original transaction scope mismatch");
    if (allocation.providerCode && allocation.providerCode !== original.providerCode) throw this.error("ERR_PAY_00012", "Payment cancellation cannot reroute the original provider");
    if (allocation.paymentModeCode && allocation.paymentModeCode !== original.paymentModeCode) throw this.error("ERR_PAY_00012", "Payment cancellation cannot reroute the original payment method");
    if (allocation.currencyCode !== original.currencyCode) throw this.error("ERR_PAY_00012", "Payment cancellation currency differs from original transaction");
    return original;
  },
  /**
   * Executes the operation operation within the paymentCore-owned layered contract.
   *
   * @param {*} original Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  operation: function (original) {
    if (original.status === "AUTHORIZED") return "VOID";
    if (["CAPTURED", "SETTLED"].includes(original.status)) return "REFUND";
    throw this.error("ERR_PAY_00012", "Payment transaction is not reversible from status " + original.status);
  },
  /**
   * Executes allocation within the paymentCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} allocation Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  executeAllocation: async function (request, allocation) {
    let input = request.body; let original = await this.original(request, allocation); let operation = input.forcedOperation || this.operation(original);
    if (operation === "REFUND" && !["CAPTURED", "SETTLED"].includes(original.status)) throw this.error("ERR_PAY_00012", "Payment refund requires captured or settled original transaction");
    let lifecycleCode = input.cancellationCode || input.refundCode;
    let idempotencyKey = [lifecycleCode, input.requestVersion, allocation.paymentGroupCode, original.transactionCode, operation].join("::");
    let replay = await this.get(request, { idempotencyKey: idempotencyKey }, 2);
    if (replay.length > 1) throw this.error("ERR_PAY_00013", "Payment cancellation idempotency evidence is ambiguous");
    if (replay.length) {
      if (replay[0].amount !== allocation.amount || replay[0].currencyCode !== allocation.currencyCode || replay[0].parentTransactionCode !== allocation.originalTransactionCode) throw this.error("ERR_PAY_00013", "Payment cancellation idempotency evidence conflicts with approved allocation");
      if (["REQUESTED", "RECONCILIATION_REQUIRED"].includes(replay[0].status)) throw this.error("ERR_PAY_00013", "Payment reversal has an uncertain provider outcome and requires reconciliation");
      return Object.assign({ idempotent: true }, replay[0]);
    }
    let prior = await this.get(request, { parentTransactionCode: original.transactionCode }, 100);
    let totals = this.sum(prior.filter(value => ["VOID", "REFUND"].includes(value.operation) && !["FAILED", "CANCELLED"].includes(value.status)).map(value => value.amount).concat([allocation.amount]));
    if (totals.units > this.units(original.amount, totals.scale)) throw this.error("ERR_PAY_00012", "Payment cancellation exceeds reversible original amount");
    let transaction = SERVICE.DefaultPaymentPolicyService.prepareTransaction({ model: {
      enterpriseCode: input.enterpriseCode, transactionCode: "payment::" + idempotencyKey, idempotencyKey: idempotencyKey,
      providerCode: original.providerCode, paymentModeCode: original.paymentModeCode, paymentGroupCode: original.paymentGroupCode,
      cartCode: original.cartCode, orderCode: original.orderCode, parentTransactionCode: original.transactionCode,
      cancellationCode: input.cancellationCode, refundCode: input.refundCode, lifecycleRequestType: input.refundCode ? "REFUND" : "CANCELLATION", requestVersion: Number(input.requestVersion), operation: operation,
      amount: allocation.amount, currencyCode: original.currencyCode, status: "REQUESTED", revision: 0, requestedAt: new Date(),
    } });
    let handler = operation === "VOID" ? "void" : "refund";
    let created = await SERVICE.DefaultPaymentTransactionService.save({ tenant: request.tenant, authData: request.authData, model: transaction });
    transaction = this.items(created)[0] || transaction;
    try {
      let result = await SERVICE.DefaultPaymentProviderGatewayService[handler](Object.assign({}, request, { transaction: transaction }));
      let patch = { status: result.status, providerTransactionRef: result.providerTransactionRef, completedAt: result.completedAt || new Date(), revision: Number(transaction.revision || 0) + 1 };
      let updated = await SERVICE.DefaultPaymentTransactionService.update({ tenant: request.tenant, authData: request.authData, query: { transactionCode: transaction.transactionCode, status: "REQUESTED", revision: Number(transaction.revision || 0) }, model: patch });
      let affected = Number(updated && (updated.modifiedCount !== undefined ? updated.modifiedCount : updated.result && updated.result.modifiedCount) || 0);
      if (affected !== 1) throw this.error("ERR_PAY_00013", "Payment reversal outcome revision conflict");
      return Object.assign({}, transaction, patch);
    } catch (error) {
      if (error.code === "ERR_PAY_00013") throw error;
      await SERVICE.DefaultPaymentTransactionService.update({ tenant: request.tenant, authData: request.authData, query: { transactionCode: transaction.transactionCode, status: "REQUESTED", revision: Number(transaction.revision || 0) }, model: { status: "RECONCILIATION_REQUIRED", recoveryAction: "RECONCILE_PROVIDER_OUTCOME", recoveryStatus: "PROVIDER_OUTCOME_UNCERTAIN", failureCode: error.code || "PROVIDER_TIMEOUT", revision: Number(transaction.revision || 0) + 1 } });
      throw error;
    }
  },
  /**
   * Executes the module artifact within the paymentCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  execute: async function (request) {
    this.authorize(request); let input = request.body || {};
    if (this.unsafe(input)) throw this.error("ERR_PAY_00011", "Payment cancellation request contains unsafe payment or provider fields");
    ["enterpriseCode", "orderCode", "requestVersion"].forEach(field => { if (input[field] === undefined || input[field] === null || input[field] === "") throw this.error("ERR_PAY_00011", "Payment reversal " + field + " is required"); });
    if (!input.cancellationCode && !input.refundCode) throw this.error("ERR_PAY_00011", "Payment reversal lifecycle request identity is required");
    if (!Array.isArray(input.allocations) || !input.allocations.length) throw this.error("ERR_PAY_00011", "Payment cancellation allocations are required");
    let evidence = [];
    for (let allocation of input.allocations) {
      ["paymentGroupCode", "originalTransactionCode", "amount", "currencyCode"].forEach(field => { if (!allocation[field]) throw this.error("ERR_PAY_00011", "Payment cancellation allocation " + field + " is required"); });
      evidence.push(await this.executeAllocation(request, allocation));
    }
    return { cancellationCode: input.cancellationCode, refundCode: input.refundCode, orderCode: input.orderCode, requestVersion: Number(input.requestVersion), transactions: evidence };
  },
};
