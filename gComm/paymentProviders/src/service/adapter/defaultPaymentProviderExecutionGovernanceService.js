/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviders/service/adapter/DefaultPaymentProviderExecutionGovernanceService
 * @description Builds safe retry, timeout, failover, and reconciliation scheduling plans for provider adapters without executing live PSP calls.
 * @layer service
 * @owner paymentProviders
 * @override Live provider modules may replace planning details, but Payment remains authoritative for transaction lifecycle and evidence.
 */
module.exports = {
  /** Initializes provider execution governance. */
  init: function () {
    return Promise.resolve(true);
  },

  /** Completes provider execution governance startup. */
  postInit: function () {
    return Promise.resolve(true);
  },

  /** Returns provider-family configuration. */
  policy: function () {
    if (typeof CONFIG === "undefined" || typeof CONFIG.get !== "function")
      return {};
    return CONFIG.get("paymentProviders") || {};
  },

  /** Returns provider-family resilience defaults. */
  resilience: function () {
    return this.policy().resilience || {};
  },

  /** Returns provider-family reconciliation scheduler defaults. */
  reconciliation: function () {
    return this.policy().reconciliation || {};
  },

  /** Returns a positive integer or the fallback. */
  positiveInteger: function (value, fallback) {
    let number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return fallback;
    return Math.floor(number);
  },

  /** Returns bounded attempts from provider policy and provider-family defaults. */
  attempts: function (providerPolicy) {
    let maximumAttempts = this.positiveInteger(
      this.resilience().maximumAttempts,
      1,
    );
    let configuredRetries = this.positiveInteger(
      providerPolicy && providerPolicy.maxRetries,
      0,
    );
    let attempts = Math.max(1, configuredRetries + 1);
    return Math.min(attempts, maximumAttempts);
  },

  /** Returns timeout in milliseconds from governed provider policy or provider-family defaults. */
  timeoutMs: function (providerPolicy) {
    return this.positiveInteger(
      providerPolicy && providerPolicy.timeoutMs,
      this.positiveInteger(this.resilience().timeoutMs, 30000),
    );
  },

  /** Returns retryable failure codes as safe strings. */
  retryableFailureCodes: function (providerPolicy) {
    let configured = providerPolicy && providerPolicy.retryableFailureCodes;
    let defaults = this.resilience().retryableFailureCodes || [];
    return (
      Array.isArray(configured) && configured.length ? configured : defaults
    ).map((code) => String(code));
  },

  /** Returns safe failover candidates from governed provider policy. */
  failoverCandidates: function (providerPolicy) {
    if (!Array.isArray(providerPolicy && providerPolicy.failoverProviderCodes))
      return [];
    return providerPolicy.failoverProviderCodes
      .filter((code) => code !== undefined && code !== null)
      .map((code) => String(code))
      .filter((code) => /^[A-Za-z][A-Za-z0-9._:-]{0,127}$/.test(code));
  },

  /** Returns whether a failure code is retryable under the current plan. */
  isRetryable: function (plan, failureCode) {
    if (!plan || !failureCode) return false;
    return (plan.retryableFailureCodes || []).includes(String(failureCode));
  },

  /** Returns whether failover may be considered after retry exhaustion. */
  canFailover: function (plan) {
    return !!(
      plan &&
      plan.failoverEnabled &&
      Array.isArray(plan.failoverProviderCodes) &&
      plan.failoverProviderCodes.length
    );
  },

  /** Builds a safe reconciliation scheduling hint; actual scheduling remains workflow/runtime owned. */
  reconciliationPlan: function (request, providerPolicy) {
    let reconciliation = this.reconciliation();
    let transaction = (request || {}).transaction || {};
    let enabled =
      providerPolicy && providerPolicy.reconciliationRequired !== undefined
        ? providerPolicy.reconciliationRequired === true
        : reconciliation.enabled === true;
    return {
      enabled: enabled,
      schedulerCode: String(
        reconciliation.schedulerCode || "payment-provider-reconciliation",
      ),
      delayMinutes: this.positiveInteger(
        providerPolicy && providerPolicy.reconciliationDelayMinutes,
        this.positiveInteger(reconciliation.delayMinutes, 15),
      ),
      idempotencyKey: [
        "payment-reconcile",
        transaction.providerCode ||
          (providerPolicy && providerPolicy.providerCode) ||
          "provider",
        transaction.transactionCode ||
          transaction.idempotencyKey ||
          "transaction",
      ].join("::"),
      operation: "RECONCILE",
    };
  },

  /** Builds the safe execution plan shared with provider adapters. */
  executionPlan: function (request) {
    let providerPolicy = (request || {}).providerPolicy || {};
    let transaction = (request || {}).transaction || {};
    let plan = {
      providerCode: String(
        providerPolicy.providerCode || transaction.providerCode || "",
      ),
      operation: String(
        providerPolicy.operation || transaction.operation || "",
      ),
      timeoutMs: this.timeoutMs(providerPolicy),
      maximumAttempts: this.attempts(providerPolicy),
      retryStrategy: String(
        providerPolicy.retryStrategy ||
          this.resilience().retryStrategy ||
          "NONE",
      ),
      retryableFailureCodes: this.retryableFailureCodes(providerPolicy),
      failoverEnabled:
        providerPolicy.failoverEnabled !== undefined
          ? providerPolicy.failoverEnabled === true
          : this.resilience().failoverEnabled === true,
      failoverProviderCodes: this.failoverCandidates(providerPolicy),
      liveProviderCallsEnabled: this.policy().liveProviderCallsEnabled === true,
      reconciliation: this.reconciliationPlan(request, providerPolicy),
    };
    return Object.freeze(plan);
  },
};
