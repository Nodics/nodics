/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviderCore/test/paymentProviderExecutionGovernanceContract
 * @description Protects provider-family timeout, retry, failover, and reconciliation scheduling plans for live PSP adapters.
 * @layer test
 * @owner paymentProviderCore
 * @override Customer PSP modules may replace transport while preserving the safe execution-plan contract.
 */
const assert = require("assert");
const properties = require("../config/properties");
const governance = require("../src/service/adapter/defaultPaymentProviderExecutionGovernanceService");

global.CONFIG = {
  get: (key) =>
    key === "paymentProviders" ? properties.paymentProviders : undefined,
};

const request = {
  transaction: {
    transactionCode: "tx-provider-governance-1",
    idempotencyKey: "tx-provider-governance-key-1",
    providerCode: "stripeProvider",
    operation: "AUTHORIZE",
  },
  providerPolicy: {
    providerCode: "stripeProvider",
    operation: "AUTHORIZE",
    timeoutMs: 12000,
    retryStrategy: "EXPONENTIAL_BACKOFF",
    maxRetries: 2,
    retryableFailureCodes: ["TIMEOUT", "RATE_LIMIT", "TEMPORARY_UNAVAILABLE"],
    failoverEnabled: true,
    failoverProviderCodes: [
      "paypalProvider",
      "manualPaymentProvider",
      "unsafe secret provider",
    ],
    reconciliationRequired: true,
    reconciliationDelayMinutes: 5,
  },
};

assert.strictEqual(properties.paymentProviders.liveProviderCallsEnabled, false);
assert.strictEqual(properties.paymentProviders.resilience.timeoutMs, 30000);
assert.strictEqual(properties.paymentProviders.resilience.maximumAttempts, 1);
assert.strictEqual(
  properties.paymentProviders.resilience.failoverEnabled,
  false,
);
assert.strictEqual(
  properties.paymentProviders.reconciliation.schedulerCode,
  "payment-provider-reconciliation",
);

const plan = governance.executionPlan(request);
assert.strictEqual(plan.providerCode, "stripeProvider");
assert.strictEqual(plan.operation, "AUTHORIZE");
assert.strictEqual(plan.timeoutMs, 12000);
assert.strictEqual(plan.maximumAttempts, 1);
assert.strictEqual(plan.retryStrategy, "EXPONENTIAL_BACKOFF");
assert.deepStrictEqual(plan.retryableFailureCodes, [
  "TIMEOUT",
  "RATE_LIMIT",
  "TEMPORARY_UNAVAILABLE",
]);
assert.strictEqual(governance.isRetryable(plan, "TIMEOUT"), true);
assert.strictEqual(governance.isRetryable(plan, "PERMANENT_DECLINE"), false);
assert.strictEqual(plan.failoverEnabled, true);
assert.deepStrictEqual(plan.failoverProviderCodes, [
  "paypalProvider",
  "manualPaymentProvider",
]);
assert.strictEqual(governance.canFailover(plan), true);
assert.strictEqual(plan.liveProviderCallsEnabled, false);
assert.strictEqual(plan.reconciliation.enabled, true);
assert.strictEqual(
  plan.reconciliation.schedulerCode,
  "payment-provider-reconciliation",
);
assert.strictEqual(plan.reconciliation.delayMinutes, 5);
assert.strictEqual(
  plan.reconciliation.idempotencyKey,
  "payment-reconcile::stripeProvider::tx-provider-governance-1",
);
assert.strictEqual(plan.secret, undefined);
assert.strictEqual(plan.rawGatewayPayload, undefined);

const defaultPlan = governance.executionPlan({
  transaction: {
    transactionCode: "tx-provider-governance-2",
    providerCode: "manualPaymentProvider",
    operation: "RECONCILE",
  },
  providerPolicy: {
    providerCode: "manualPaymentProvider",
    operation: "RECONCILE",
  },
});
assert.strictEqual(defaultPlan.timeoutMs, 30000);
assert.strictEqual(defaultPlan.maximumAttempts, 1);
assert.strictEqual(defaultPlan.retryStrategy, "NONE");
assert.strictEqual(defaultPlan.failoverEnabled, false);
assert.strictEqual(defaultPlan.reconciliation.enabled, false);

console.log("Payment provider execution governance contract validated");
