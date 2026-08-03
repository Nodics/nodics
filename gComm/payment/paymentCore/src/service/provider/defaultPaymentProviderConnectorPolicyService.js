/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/service/provider/DefaultPaymentProviderConnectorPolicyService
 * @description Validates safe connector references for Payment Providers without resolving or exposing credential values.
 * @layer service
 * @owner payment
 * @override Customer modules may integrate enterprise secret managers or connector registries while preserving safe reference-only Payment records.
 */
module.exports = {
  /** Initializes connector policy validation. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes connector policy validation startup. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns layered connector policy. */
  policy: function () {
    return (
      ((CONFIG.get("payment") || {}).paymentPolicy || {}).connectorPolicy || {}
    );
  },
  /** Creates a stable connector-policy error. */
  error: function (message) {
    if (typeof CLASSES !== "undefined" && CLASSES.NodicsError)
      return new CLASSES.NodicsError(message, null, "ERR_PAY_00010");
    let error = new Error(message);
    error.code = "ERR_PAY_00010";
    return error;
  },
  /** Returns true when provider type normally requires an external connector reference. */
  requiresReference: function (provider) {
    if (!((this.policy() || {}).requireConnectorReferenceForGateway !== false))
      return false;
    return [
      "CARD_GATEWAY",
      "WALLET",
      "CARD_NETWORK",
      "PROJECT_PROVIDER",
    ].includes(provider && provider.providerType);
  },
  /** Validates one safe string reference. */
  validateReference: function (value, pattern, label) {
    if (value === undefined || value === null || value === "") return true;
    if (typeof value !== "string")
      throw this.error(label + " must be a safe string reference");
    let forbidden = (this.policy().forbiddenReferenceTerms || []).map((term) =>
      String(term).toLowerCase(),
    );
    let normalized = value.toLowerCase();
    if (forbidden.some((term) => normalized.includes(term)))
      throw this.error(label + " must not contain credential-like terms");
    if (!new RegExp(pattern).test(value))
      throw this.error(label + " format is invalid");
    return true;
  },
  /** Validates provider connector references without reading secrets. */
  validateProvider: function (provider) {
    let policy = this.policy();
    let connectorCode = provider && provider.connectorCode;
    let configRef = provider && provider.configRef;
    this.validateReference(
      connectorCode,
      policy.connectorCodePattern || "^[A-Za-z][A-Za-z0-9._:-]{0,127}$",
      "Payment Provider connectorCode",
    );
    this.validateReference(
      configRef,
      policy.configRefPattern || "^[A-Za-z][A-Za-z0-9._:-]{0,255}$",
      "Payment Provider configRef",
    );
    if (this.requiresReference(provider) && !connectorCode && !configRef) {
      throw this.error(
        "Payment Provider connectorCode or configRef is required for gateway providers",
      );
    }
    return {
      connectorReferencePresent: !!(connectorCode || configRef),
      rotationAuthority:
        policy.rotationAuthority || "connector-secret-authority",
      credentialsResolved: false,
    };
  },
  /** Builds a safe rotation request descriptor without rotating or exposing credentials. */
  rotationRequest: function (provider) {
    let validation = this.validateProvider(provider);
    return {
      providerCode: provider.providerCode,
      connectorCode: provider.connectorCode,
      configRef: provider.configRef,
      rotationAuthority: validation.rotationAuthority,
      rotationRequired: true,
      credentialsResolved: false,
    };
  },
};
