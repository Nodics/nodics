/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentProviderGatewayService
 * @description Safe replaceable payment-provider boundary used by checkout authorization before real gateway connectors are introduced.
 * @layer service
 * @owner payment
 * @override Project modules replace this service to integrate PSPs, wallets, bank transfer, COD, or customer-specific payment providers without changing Cart or Order.
 */
module.exports = {
  registeredAdapters: {},
  /** Initializes payment provider gateway boundary. */
  init: function () {
    this.registeredAdapters = {};
    return Promise.resolve(true);
  },
  /** Completes payment provider gateway boundary startup. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Registers a provider-module adapter without changing Payment authority. */
  register: function (providerCode, adapter) {
    if (!providerCode || !adapter)
      throw this.error(
        "Payment provider adapter registration requires providerCode and adapter",
      );
    this.registeredAdapters[String(providerCode)] = adapter;
    return true;
  },
  /** Removes a provider-module adapter during module shutdown. */
  unregister: function (providerCode) {
    if (providerCode) delete this.registeredAdapters[String(providerCode)];
    return true;
  },
  /** Creates a stable payment provider error. */
  error: function (message) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError)
      return new CLASSES.NodicsError(message, null, "ERR_PAY_00002");
    let error = new Error(message);
    error.code = "ERR_PAY_00002";
    return error;
  },
  /** Resolves successful transaction status for the requested operation. */
  successStatus: function (operation) {
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultPaymentPolicyService &&
      typeof SERVICE.DefaultPaymentPolicyService.successStatus === "function"
    ) {
      return SERVICE.DefaultPaymentPolicyService.successStatus(operation);
    }
    if (operation === "DEFER") return "DEFERRED";
    if (operation === "CAPTURE") return "CAPTURED";
    if (operation === "REFUND") return "REFUNDED";
    if (operation === "VOID") return "VOIDED";
    return "AUTHORIZED";
  },
  /** Authorizes or defers one safe payment transaction without exposing raw provider payloads. */
  authorize: async function (request) {
    return this.executeOperation(request, "authorize", ["AUTHORIZE", "DEFER"]);
  },
  /** Captures one safe payment transaction without exposing raw provider payloads. */
  capture: async function (request) {
    return this.executeOperation(request, "capture", ["CAPTURE"]);
  },
  /** Voids one safe payment transaction without exposing raw provider payloads. */
  void: async function (request) {
    return this.executeOperation(request, "void", ["VOID"]);
  },
  /** Reconciles one safe payment transaction without exposing raw provider payloads. */
  reconcile: async function (request) {
    return this.executeOperation(request, "reconcile", ["RECONCILE"]);
  },
  /** Refunds one safe payment transaction without exposing raw provider payloads. */
  refund: async function (request) {
    return this.executeOperation(request, "refund", ["REFUND"]);
  },
  /** Executes one provider operation through the configured adapter. */
  executeOperation: async function (
    request,
    adapterOperation,
    allowedOperations,
  ) {
    let transaction = (request || {}).transaction || {};
    if (
      !transaction.transactionCode ||
      !transaction.operation ||
      !allowedOperations.includes(transaction.operation)
    ) {
      throw this.error(
        "Payment provider gateway requires " +
          allowedOperations.join("/") +
          " transaction evidence",
      );
    }
    let executionPolicy = await this.executionPolicy(request);
    let adapter = this.adapter(
      executionPolicy.adapterService,
      executionPolicy.providerCode,
    );
    let executionPlan = this.executionPlan(request, executionPolicy);
    let handler =
      typeof adapter[adapterOperation] === "function"
        ? adapter[adapterOperation]
        : adapter.authorize;
    if (typeof handler !== "function") handler = this.localResult.bind(this);
    return handler.call(
      adapter,
      Object.assign({}, request, {
        providerPolicy: executionPolicy,
        providerExecutionPlan: executionPlan,
        providerGatewayService: this,
      }),
    );
  },
  /** Builds an optional provider execution plan through the provider-family governance service. */
  executionPlan: function (request, executionPolicy) {
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultPaymentProviderExecutionGovernanceService &&
      typeof SERVICE.DefaultPaymentProviderExecutionGovernanceService
        .executionPlan === "function"
    ) {
      return SERVICE.DefaultPaymentProviderExecutionGovernanceService.executionPlan(
        Object.assign({}, request, {
          providerPolicy: executionPolicy,
        }),
      );
    }
    return {
      providerCode: executionPolicy && executionPolicy.providerCode,
      operation: executionPolicy && executionPolicy.operation,
      timeoutMs: 30000,
      maximumAttempts: 1,
      retryStrategy: "NONE",
      retryableFailureCodes: [],
      failoverEnabled: false,
      failoverProviderCodes: [],
      liveProviderCallsEnabled: false,
      reconciliation: {
        enabled: false,
        schedulerCode: "payment-provider-reconciliation",
        delayMinutes: 15,
        operation: "RECONCILE",
      },
    };
  },
  /** Resolves effective provider execution policy. */
  executionPolicy: async function (request) {
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultPaymentProviderPolicyService &&
      typeof SERVICE.DefaultPaymentProviderPolicyService.resolveForRequest ===
        "function"
    ) {
      return SERVICE.DefaultPaymentProviderPolicyService.resolveForRequest(
        request,
      );
    }
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultPaymentProviderPolicyService &&
      typeof SERVICE.DefaultPaymentProviderPolicyService.resolve === "function"
    ) {
      return SERVICE.DefaultPaymentProviderPolicyService.resolve(request);
    }
    let transaction = (request || {}).transaction || {};
    return {
      providerCode: transaction.providerCode,
      operation: transaction.operation,
      adapterService: "DefaultManualPaymentProviderAdapterService",
      gatewayRequired: true,
    };
  },
  /** Resolves configured provider adapter service with a safe fallback. */
  adapter: function (adapterService, providerCode) {
    if (
      typeof SERVICE !== "undefined" &&
      adapterService &&
      SERVICE[adapterService]
    )
      return SERVICE[adapterService];
    if (
      providerCode &&
      this.registeredAdapters &&
      this.registeredAdapters[providerCode]
    )
      return this.registeredAdapters[providerCode];
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultManualPaymentProviderAdapterService
    )
      return SERVICE.DefaultManualPaymentProviderAdapterService;
    return {
      authorize: async (request) => this.localResult(request),
      capture: async (request) => this.localResult(request),
      void: async (request) => this.localResult(request),
      refund: async (request) => this.localResult(request),
      reconcile: async (request) => this.localResult(request),
    };
  },
  /** Builds safe local evidence when no adapter is available in standalone tests. */
  localResult: function (request) {
    let transaction = (request || {}).transaction || {};
    let status = this.successStatus(transaction.operation);
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
