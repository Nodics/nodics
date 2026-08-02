/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentProviderPolicyService
 * @description Builds effective payment provider execution policy from method, provider, operation, and request context.
 * @layer service
 * @owner payment
 * @override Customer modules may replace this service for enterprise routing, provider failover, capture strategy, retry policy, or country-specific payment rules.
 */
module.exports = {
  /** Initializes payment provider policy. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes payment provider policy startup. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Creates a stable provider policy error. */
  error: function (message) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError)
      return new CLASSES.NodicsError(message, null, "ERR_PAY_00008");
    let error = new Error(message);
    error.code = "ERR_PAY_00008";
    return error;
  },
  /** Builds a normalized execution policy from method, provider, and operation. */
  build: function (method, provider, operation) {
    return {
      method: method,
      provider: provider,
      providerCode: provider.providerCode,
      providerType: provider.providerType,
      operation: operation,
      adapterService:
        provider.adapterService || "DefaultManualPaymentProviderAdapterService",
      gatewayRequired: method.gatewayRequired === true,
      policyService:
        provider.policyService || "DefaultPaymentProviderPolicyService",
      configurationSource:
        provider.configurationSource || "MODULE_CONFIGURATION",
      connectorCode: provider.connectorCode,
      configRef: provider.configRef,
    };
  },
  /** Extracts result arrays from Nodics service responses. */
  items: function (response) {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.result)) return response.result;
    if (response && response.result && Array.isArray(response.result.items))
      return response.result.items;
    if (response && Array.isArray(response.items)) return response.items;
    return [];
  },
  /** Returns whether governed provider execution policy records can be read in this runtime. */
  hasExecutionPolicyRecordService: function () {
    return (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultPaymentProviderExecutionPolicyService &&
      typeof SERVICE.DefaultPaymentProviderExecutionPolicyService.get ===
        "function"
    );
  },
  /** Builds the governed provider execution-policy query for the current request. */
  executionPolicyQuery: function (request, method, provider, operation) {
    let transaction = (request || {}).transaction || {};
    let enterpriseCode =
      (request || {}).enterpriseCode ||
      (request || {}).entCode ||
      transaction.enterpriseCode ||
      transaction.entCode;
    let query = {
      providerCode: provider.providerCode,
      status: "ACTIVE",
    };
    if (enterpriseCode) query.enterpriseCode = enterpriseCode;
    return query;
  },
  /** Returns true when a candidate policy matches provider, method, and operation scope. */
  executionPolicyMatches: function (candidate, method, provider, operation) {
    if (!candidate || candidate.status !== "ACTIVE") return false;
    if (
      candidate.providerCode &&
      candidate.providerCode !== provider.providerCode
    )
      return false;
    if (
      candidate.methodCode &&
      method &&
      candidate.methodCode !== method.methodCode
    )
      return false;
    if (candidate.operation && candidate.operation !== operation) return false;
    return true;
  },
  /** Reads the best governed provider execution policy, if Axis/customer configuration has supplied one. */
  executionPolicyRecord: async function (request, method, provider, operation) {
    if (!this.hasExecutionPolicyRecordService()) return undefined;
    let response =
      await SERVICE.DefaultPaymentProviderExecutionPolicyService.get({
        tenant: request && request.tenant,
        authData: request && request.authData,
        query: this.executionPolicyQuery(request, method, provider, operation),
        searchOptions: {
          limit: Number(
            (this.policyRecordLimit && this.policyRecordLimit()) || 25,
          ),
        },
      });
    let matches = this.items(response)
      .filter((candidate) =>
        this.executionPolicyMatches(candidate, method, provider, operation),
      )
      .sort(
        (left, right) =>
          Number(left.priority || 100) - Number(right.priority || 100),
      );
    return matches[0];
  },
  /** Returns bounded policy-record read limit from configuration. */
  policyRecordLimit: function () {
    if (typeof CONFIG === "undefined" || typeof CONFIG.get !== "function")
      return 25;
    let policy = (CONFIG.get("payment") || {}).paymentPolicy || {};
    return policy.providerExecutionPolicyRecordLimit || 25;
  },
  /** Merges safe governed execution policy fields without letting records carry secrets into runtime evidence. */
  applyExecutionPolicyRecord: function (executionPolicy, record) {
    if (!record) return executionPolicy;
    let merged = Object.assign({}, executionPolicy, {
      executionPolicyCode: record.policyCode,
      captureStrategy: record.captureStrategy,
      authorizationTtlMinutes: record.authorizationTtlMinutes,
      retryStrategy: record.retryStrategy,
      timeoutMs: record.timeoutMs,
      maxRetries: record.maxRetries,
      retryableFailureCodes: Array.isArray(record.retryableFailureCodes)
        ? record.retryableFailureCodes.slice()
        : undefined,
      failoverEnabled: record.failoverEnabled,
      failoverProviderCodes: Array.isArray(record.failoverProviderCodes)
        ? record.failoverProviderCodes.slice()
        : undefined,
      reconciliationRequired: record.reconciliationRequired,
      reconciliationDelayMinutes: record.reconciliationDelayMinutes,
      connectorCode: record.connectorCode || executionPolicy.connectorCode,
      configRef: record.configRef || executionPolicy.configRef,
      configurationSource: "GOVERNED_EXECUTION_POLICY",
    });
    delete merged.secret;
    delete merged.password;
    delete merged.apiKey;
    delete merged.accessToken;
    delete merged.refreshToken;
    delete merged.cardNumber;
    delete merged.cvv;
    delete merged.pan;
    delete merged.rawGatewayPayload;
    delete merged.providerPayload;
    return merged;
  },
  /** Resolves full execution policy from synchronous module configuration. */
  resolve: function (request) {
    let transaction = (request || {}).transaction || request || {};
    let methodService = SERVICE.DefaultPaymentMethodPolicyService;
    let registryService = SERVICE.DefaultPaymentProviderRegistryService;
    if (!methodService || typeof methodService.method !== "function")
      throw this.error("Payment method policy service is unavailable");
    if (!registryService || typeof registryService.provider !== "function")
      throw this.error("Payment provider registry service is unavailable");
    let method = methodService.method(transaction.paymentModeCode);
    let operation =
      transaction.operation || method.defaultOperation || "AUTHORIZE";
    let providerCode =
      transaction.providerCode ||
      registryService.defaultProviderCode(method.methodCode);
    let provider = registryService.provider(providerCode);
    registryService.assertSupports(provider, method.methodCode, operation);
    return this.build(method, provider, operation);
  },
  /** Resolves full execution policy, preferring governed Axis-managed provider records when available. */
  resolveForRequest: async function (request) {
    let transaction = (request || {}).transaction || request || {};
    let methodService = SERVICE.DefaultPaymentMethodPolicyService;
    let registryService = SERVICE.DefaultPaymentProviderRegistryService;
    if (!methodService || typeof methodService.method !== "function")
      throw this.error("Payment method policy service is unavailable");
    if (
      !registryService ||
      typeof registryService.providerForRequest !== "function"
    )
      return this.resolve(request);
    let method = methodService.method(transaction.paymentModeCode);
    let operation =
      transaction.operation || method.defaultOperation || "AUTHORIZE";
    let providerCode =
      transaction.providerCode ||
      registryService.defaultProviderCode(method.methodCode);
    let provider = await registryService.providerForRequest(
      providerCode,
      request || {},
    );
    registryService.assertSupports(provider, method.methodCode, operation);
    let executionPolicy = this.build(method, provider, operation);
    let record = await this.executionPolicyRecord(
      request || {},
      method,
      provider,
      operation,
    );
    return this.applyExecutionPolicyRecord(executionPolicy, record);
  },
};
