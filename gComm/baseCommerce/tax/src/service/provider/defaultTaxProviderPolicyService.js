/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module tax/service/provider/DefaultTaxProviderPolicyService
 * @description Resolves provider-policy defaults for Tax integrations without owning provider credentials or customer-specific adapter code.
 * @layer service
 * @owner tax
 * @override Customer modules may replace provider selection, jurisdiction routing, retry, failover, and reconciliation policy through this service.
 */
module.exports = {
  /**
   * Executes the init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the post init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the config contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  config: function () {
    return (CONFIG.get("tax") || {}).provider || {};
  },
  /**
   * Executes the get allowed provider types contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getAllowedProviderTypes: function () {
    return [].concat(this.config().providerTypes || []);
  },
  /**
   * Executes the get allowed operations contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getAllowedOperations: function () {
    return [].concat(this.config().operations || []);
  },
  /**
   * Executes the resolve adapter contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  resolveAdapter: function (provider) {
    const record = provider || {};
    if (!record.adapterService) {
      throw new CLASSES.NodicsError(
        "Tax provider adapter is required",
        null,
        "ERR_TAX_00017",
      );
    }
    return {
      providerCode: record.providerCode,
      providerType: record.providerType,
      adapterService: record.adapterService,
      policyService: record.policyService || "DefaultTaxProviderPolicyService",
      connectorCode: record.connectorCode,
      configRef: record.configRef,
      operations: [].concat(record.operations || []),
    };
  },
};
