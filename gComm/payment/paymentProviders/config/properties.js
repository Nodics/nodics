/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviders/config/properties
 * @description Configures provider-family defaults without selecting a payment provider.
 * @layer configuration
 * @owner paymentProviders
 * @override Project modules may layer resilience defaults and provider-specific policy while preserving Payment as the authority.
 */
module.exports = {
  paymentProviders: {
    contractVersion: 1,
    enabled: true,
    liveProviderCallsEnabled: false,
    resilience: {
      timeoutMs: 30000,
      maximumAttempts: 1,
      retryStrategy: "NONE",
      failoverEnabled: false,
      retryableFailureCodes: ["TIMEOUT", "RATE_LIMIT", "TEMPORARY_UNAVAILABLE"],
    },
    reconciliation: {
      enabled: false,
      schedulerCode: "payment-provider-reconciliation",
      delayMinutes: 15,
    },
    evidence: {
      redactRawPayloads: true,
      maximumSafeMessageLength: 240,
    },
  },
};
