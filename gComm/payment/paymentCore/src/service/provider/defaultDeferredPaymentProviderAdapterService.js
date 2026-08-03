/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultDeferredPaymentProviderAdapterService
 * @description Safe adapter for deferred payment methods such as cash on delivery or bank transfer.
 * @layer service
 * @owner payment
 * @override Customer modules may replace this adapter for provider-specific deferred payment confirmation and settlement logic.
 */
module.exports = {
  /** Initializes the deferred provider adapter. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes deferred provider adapter startup. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Defers payment evidence without external gateway payloads. */
  authorize: async function (request) {
    if (
      typeof SERVICE === "undefined" ||
      !SERVICE.DefaultManualPaymentProviderAdapterService
    ) {
      return this.localResult(request);
    }
    return SERVICE.DefaultManualPaymentProviderAdapterService.authorize(
      request,
    );
  },
  /** Refunds deferred payment evidence without external gateway payloads. */
  refund: async function (request) {
    return this.delegate(request, "refund");
  },
  /** Captures deferred payment evidence without external gateway payloads. */
  capture: async function (request) {
    return this.delegate(request, "capture");
  },
  /** Voids deferred payment evidence without external gateway payloads. */
  void: async function (request) {
    return this.delegate(request, "void");
  },
  /** Reconciles deferred payment evidence without external gateway payloads. */
  reconcile: async function (request) {
    return this.delegate(request, "reconcile");
  },
  /** Delegates to the manual safe adapter when no real deferred provider is layered. */
  delegate: async function (request, operation) {
    if (
      typeof SERVICE === "undefined" ||
      !SERVICE.DefaultManualPaymentProviderAdapterService
    ) {
      return this.localResult(request);
    }
    let adapter = SERVICE.DefaultManualPaymentProviderAdapterService;
    let handler =
      typeof adapter[operation] === "function"
        ? adapter[operation]
        : adapter.authorize;
    return handler.call(adapter, request);
  },
  /** Produces fallback safe transaction evidence for direct adapter tests. */
  localResult: function (request) {
    let gateway = request && request.providerGatewayService;
    if (gateway && typeof gateway.localResult === "function")
      return gateway.localResult(request);
    let transaction = (request || {}).transaction || {};
    let statusByOperation = {
      CAPTURE: "CAPTURED",
      DEFER: "DEFERRED",
      REFUND: "REFUNDED",
      VOID: "VOIDED",
      RECONCILE: "RECONCILED",
    };
    let status = statusByOperation[transaction.operation] || "AUTHORIZED";
    return {
      transactionCode: transaction.transactionCode,
      idempotencyKey: transaction.idempotencyKey,
      providerCode: transaction.providerCode,
      operation: transaction.operation,
      status: status,
      providerTransactionRef: [
        String(status).toLowerCase(),
        transaction.transactionCode,
      ].join("::"),
      completedAt: new Date(),
    };
  },
};
