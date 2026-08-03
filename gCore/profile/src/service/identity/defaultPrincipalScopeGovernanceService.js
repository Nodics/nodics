/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultPrincipalScopeGovernanceService
 * @description Validates and resolves tenant, enterprise, catalog, and operational scope assignments for Profile-owned principals.
 * @layer service
 * @owner profile
 * @override Project modules may extend scope types, effects, and resolver behavior through configuration and later-layer services.
 */
module.exports = {
  /**
   * Executes the get policy contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getPolicy: function () {
    let policy = CONFIG.get("principalAuthorizationScopes") || {};
    if (!policy.enabled)
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scopes are disabled",
      );
    [
      "principalTypes",
      "effects",
      "statuses",
      "scopeTypes",
      "inheritanceModes",
    ].forEach((key) => {
      if (!Array.isArray(policy[key]) || policy[key].length === 0) {
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Principal authorization scope policy is incomplete: " + key,
        );
      }
    });
    return policy;
  },
  /**
   * Executes the normalize models contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  normalizeModels: function (model) {
    return Array.isArray(model) ? model : [model || {}];
  },
  /**
   * Executes the apply update contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  applyUpdate: function (existing, update) {
    let effective = Object.assign({}, existing || {});
    Object.keys(update || {})
      .filter((key) => !key.startsWith("$"))
      .forEach((key) => {
        effective[key] = update[key];
      });
    Object.assign(effective, (update && update.$set) || {});
    Object.keys((update && update.$unset) || {}).forEach((key) => {
      delete effective[key];
    });
    return effective;
  },
  /**
   * Executes the normalize string contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  normalizeString: function (value) {
    return typeof value === "string" ? value.trim() : value;
  },
  /**
   * Executes the normalize assignment contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  normalizeAssignment: function (assignment) {
    let normalized = Object.assign({}, assignment || {});
    [
      "principalType",
      "principalCode",
      "groupCode",
      "permissionCode",
      "capabilityCode",
      "scopeType",
      "scopeCode",
      "tenantCode",
      "enterpriseCode",
      "effect",
      "inheritanceMode",
      "status",
      "reasonCode",
    ].forEach((key) => {
      normalized[key] = this.normalizeString(normalized[key]);
    });
    let policy = this.getPolicy();
    normalized.effect = normalized.effect || policy.defaultEffect;
    normalized.status = normalized.status || policy.defaultStatus;
    normalized.inheritanceMode =
      normalized.inheritanceMode || policy.defaultInheritanceMode;
    return normalized;
  },
  /**
   * Executes the is blank contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  isBlank: function (value) {
    return value === undefined || value === null || value === "";
  },
  /**
   * Executes the assert listed contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  assertListed: function (policy, key, value, label) {
    if (!policy[key].includes(value)) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Invalid principal authorization " + label + ": " + value,
      );
    }
  },
  /**
   * Executes the assert date order contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  assertDateOrder: function (assignment) {
    if (!assignment.effectiveFrom || !assignment.effectiveTo) return;
    let from = new Date(assignment.effectiveFrom).getTime();
    let to = new Date(assignment.effectiveTo).getTime();
    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scope effective dates are invalid",
      );
    }
  },
  /**
   * Executes the validate assignment contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateAssignment: function (assignment) {
    let policy = this.getPolicy();
    let normalized = this.normalizeAssignment(assignment);
    this.assertListed(
      policy,
      "principalTypes",
      normalized.principalType,
      "principal type",
    );
    this.assertListed(policy, "scopeTypes", normalized.scopeType, "scope type");
    this.assertListed(policy, "effects", normalized.effect, "effect");
    this.assertListed(policy, "statuses", normalized.status, "status");
    this.assertListed(
      policy,
      "inheritanceModes",
      normalized.inheritanceMode,
      "inheritance mode",
    );
    if (this.isBlank(normalized.scopeCode))
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scope code is required",
      );
    if (normalized.scopeCode.length > policy.maximumScopeCodeLength) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal authorization scope code exceeds maximum length",
      );
    }
    if (normalized.principalType === "group") {
      if (this.isBlank(normalized.groupCode))
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Group scope assignments require groupCode",
        );
      if (!this.isBlank(normalized.principalCode))
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Group scope assignments must not carry principalCode",
        );
    } else if (this.isBlank(normalized.principalCode)) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Principal scope assignments require principalCode",
      );
    }
    if (
      normalized.scopeType === "TENANT" &&
      this.isBlank(normalized.tenantCode)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Tenant scope assignments require tenantCode",
      );
    }
    if (
      normalized.scopeType === "ENTERPRISE" &&
      this.isBlank(normalized.enterpriseCode)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_AUTH_00003",
        "Enterprise scope assignments require enterpriseCode",
      );
    }
    this.assertDateOrder(normalized);
    return normalized;
  },
  /**
   * Executes the validate save contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateSave: function (request) {
    this.normalizeModels(request.model).forEach((model) =>
      this.validateAssignment(model),
    );
    return true;
  },
  /**
   * Executes the validate update contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateUpdate: function (request) {
    let updates = this.normalizeModels(request.model);
    if (!request.query || !SERVICE.DefaultPrincipalScopeAssignmentService) {
      updates.forEach((model) => this.validateAssignment(model));
      return true;
    }
    return SERVICE.DefaultPrincipalScopeAssignmentService.get({
      tenant: request.tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: request.query,
      options: { recursive: false },
    }).then((result) => {
      let existing = (result && result.result) || [];
      if (existing.length === 0)
        throw new CLASSES.NodicsError(
          "ERR_AUTH_00003",
          "Principal scope assignment update requires an existing record",
        );
      existing
        .map((assignment) => this.applyUpdate(assignment, updates[0]))
        .forEach((assignment) => this.validateAssignment(assignment));
      return true;
    });
  },
  /**
   * Executes the validate contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validate: function (request) {
    return request && request.query
      ? this.validateUpdate(request)
      : this.validateSave(request);
  },
  /**
   * Executes the is effective contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  isEffective: function (assignment, now) {
    if (assignment.status !== "ACTIVE") return false;
    let time = now ? new Date(now).getTime() : Date.now();
    let from = assignment.effectiveFrom
      ? new Date(assignment.effectiveFrom).getTime()
      : undefined;
    let to = assignment.effectiveTo
      ? new Date(assignment.effectiveTo).getTime()
      : undefined;
    if (Number.isFinite(from) && time < from) return false;
    if (Number.isFinite(to) && time > to) return false;
    return true;
  },
  /**
   * Executes the get principal group codes contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getPrincipalGroupCodes: function (authData) {
    return Array.from(
      new Set(
        []
          .concat(
            (authData && authData.userGroups) || [],
            (authData && authData.allUserGroupCodes) || [],
          )
          .filter((value) => typeof value === "string" && value.trim()),
      ),
    );
  },
  /**
   * Executes the build scope key contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  buildScopeKey: function (assignment) {
    return [
      assignment.scopeType,
      assignment.scopeCode,
      assignment.permissionCode || "*",
      assignment.capabilityCode || "*",
    ].join("::");
  },
  /**
   * Executes the applies to principal contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  appliesToPrincipal: function (assignment, authData) {
    if (!assignment || !authData) return false;
    if (assignment.principalType === "group") {
      return this.getPrincipalGroupCodes(authData).includes(
        assignment.groupCode,
      );
    }
    return (
      assignment.principalType === authData.principalType &&
      (assignment.principalCode === authData.loginId ||
        assignment.principalCode === authData.code ||
        assignment.principalCode === authData.principalCode)
    );
  },
  /**
   * Executes the resolve assignments contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  resolveAssignments: function (authData, assignments, options) {
    let resolved = {};
    let denied = {};
    let now = options && options.now;
    (assignments || [])
      .map((assignment) => this.normalizeAssignment(assignment))
      .filter((assignment) => this.isEffective(assignment, now))
      .filter((assignment) => this.appliesToPrincipal(assignment, authData))
      .forEach((assignment) => {
        let key = this.buildScopeKey(assignment);
        if (assignment.effect === "DENY") {
          denied[key] = assignment;
          delete resolved[key];
        } else if (!denied[key]) {
          resolved[key] = assignment;
        }
      });
    return {
      principalCode:
        authData &&
        (authData.loginId || authData.code || authData.principalCode),
      principalType: authData && authData.principalType,
      scopeCount: Object.keys(resolved).length,
      scopes: Object.keys(resolved)
        .sort()
        .map((key) => resolved[key]),
      deniedScopes: Object.keys(denied)
        .sort()
        .map((key) => denied[key]),
    };
  },
  /**
   * Executes the get effective scopes contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getEffectiveScopes: function (request) {
    let authData = request.authData || {};
    let query = {
      status: "ACTIVE",
      $or: [
        {
          principalType: authData.principalType,
          principalCode:
            authData.loginId || authData.code || authData.principalCode,
        },
        {
          principalType: "group",
          groupCode: { $in: this.getPrincipalGroupCodes(authData) },
        },
      ],
    };
    return SERVICE.DefaultPrincipalScopeAssignmentService.get({
      tenant: request.tenant,
      authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
      query: query,
      options: { recursive: false },
    }).then((result) =>
      this.resolveAssignments(
        authData,
        (result && result.result) || [],
        request.options,
      ),
    );
  },
};
