/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module tax/service/foundation/DefaultTaxEnterpriseScopeService
 * @description Applies authenticated enterprise scope and deterministic identity to Tax records.
 * @layer service
 * @owner tax
 * @override Project modules may replace this service to enforce stricter enterprise, store, channel, or jurisdiction scoping without changing Tax schemas.
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
    return CONFIG.get("tax") || {};
  },
  /**
   * Executes the error contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  error: function (code, message) {
    return new CLASSES.NodicsError(message || code, null, code);
  },
  /**
   * Executes the resolve enterprise code contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  resolveEnterpriseCode: function (request) {
    const authData = (request || {}).authData || {};
    const enterprise = authData.enterprise || {};
    const enterpriseCode =
      enterprise.code ||
      authData.enterpriseCode ||
      (request || {}).enterpriseCode ||
      ((request || {}).model || {}).enterpriseCode;
    if (
      !enterpriseCode &&
      ((this.config() || {}).enterpriseScope || {}).required !== false
    ) {
      throw this.error("ERR_TAX_00001", "Tax enterprise scope is required");
    }
    return enterpriseCode;
  },
  /**
   * Executes the assert business code contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  assertBusinessCode: function (value, label) {
    const identity = (this.config() || {}).identity || {};
    const text = String(value || "");
    const pattern = new RegExp(
      identity.codePattern || "^[A-Za-z0-9][A-Za-z0-9._-]*$",
    );
    if (!pattern.test(text))
      throw this.error("ERR_TAX_00002", label + " is invalid");
    return text;
  },
  /**
   * Executes the build code contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  buildCode: function (enterpriseCode, type, identityValues) {
    const identity = (this.config() || {}).identity || {};
    const separator = identity.separator || "::";
    const code = [enterpriseCode, type]
      .concat(identityValues || [])
      .join(separator);
    if (code.length > Number(identity.maxCodeLength || 128)) {
      throw this.error("ERR_TAX_00003", "Tax code exceeds configured length");
    }
    return code;
  },
  /**
   * Executes the scope new model contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  scopeNewModel: function (request, type, identityProperties) {
    const model = (request.model = Object.assign({}, request.model || {}));
    const enterpriseCode = this.resolveEnterpriseCode(request);
    if (model.enterpriseCode && model.enterpriseCode !== enterpriseCode) {
      throw this.error(
        "ERR_TAX_00004",
        "Tax enterprise cannot be changed by payload",
      );
    }
    const identities = (identityProperties || []).map((property) =>
      this.assertBusinessCode(model[property], property),
    );
    model.enterpriseCode = enterpriseCode;
    model.code = this.buildCode(enterpriseCode, type, identities);
    return model;
  },
  /**
   * Executes the scope query contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  scopeQuery: function (request) {
    request.query = Object.assign({}, request.query || {}, {
      enterpriseCode: this.resolveEnterpriseCode(request),
    });
    return true;
  },
};
