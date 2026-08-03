/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module inventory/service/serialized/DefaultSerializedStockUnitPolicyService
 * @description Governs serialized unit identity, enterprise scope, lifecycle states, and persistence boundaries.
 * @layer service
 * @owner inventory
 * @override Projects may extend lifecycle and metadata while preserving aggregate Stock Balance authority and no hard delete.
 */
module.exports = {
  /** Initializes serialized-unit policy. */ init: function () {
    return Promise.resolve(true);
  },
  /** Completes serialized-unit policy initialization. */ postInit:
    function () {
      return Promise.resolve(true);
    },
  /** Returns serialized-unit policy configuration. */
  policy: function () {
    return (CONFIG.get("inventory") || {}).serializedStockUnit || {};
  },
  /** Builds an Inventory-scoped error. */
  error: function (message) {
    return new CLASSES.NodicsError("ERR_INV_00052", message);
  },
  /** Allows persistence only from Inventory-owned serialized-unit orchestration or approved project extensions. */
  authorizeMutation: function (request) {
    return request && request._serializedStockUnitMutationAuthorized === true
      ? Promise.resolve(true)
      : Promise.reject(
          this.error(
            "Serialized Stock Unit state can change only through Inventory serialized-unit policy",
          ),
        );
  },
  /** Rejects hard delete of serialized identity and lifecycle evidence. */
  rejectDelete: function () {
    return Promise.reject(
      this.error("Serialized Stock Unit evidence cannot be deleted"),
    );
  },
  /** Validates one configured enum value. */
  requireOneOf: function (value, allowed, label) {
    if (!allowed.includes(value))
      throw this.error(
        label + " is not allowed by serializedStockUnit configuration",
      );
    return value;
  },
  /** Normalizes one serialized unit before persistence. */
  validateUnit: function (model) {
    model = Object.assign({}, model || {});
    [
      "serializedUnitCode",
      "serialNumber",
      "warehouseCode",
      "itemType",
      "itemCode",
      "unitCode",
    ].forEach((field) => {
      SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(
        model[field],
        "Serialized Stock Unit " + field,
      );
    });
    if (!SERVICE.DefaultInventoryEnterpriseScopeService.text(model.stockCode))
      throw this.error("Serialized Stock Unit stockCode is required");
    if (model.assetTag)
      SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(
        model.assetTag,
        "Serialized Stock Unit assetTag",
      );
    if (model.reservationCode)
      SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(
        model.reservationCode,
        "Serialized Stock Unit reservationCode",
      );
    if (model.allocationCode)
      SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(
        model.allocationCode,
        "Serialized Stock Unit allocationCode",
      );
    if (model.demandType)
      SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(
        model.demandType,
        "Serialized Stock Unit demandType",
      );
    if (model.demandCode)
      SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(
        model.demandCode,
        "Serialized Stock Unit demandCode",
      );
    if (model.demandLineCode)
      SERVICE.DefaultInventoryEnterpriseScopeService.validateBusinessCode(
        model.demandLineCode,
        "Serialized Stock Unit demandLineCode",
      );
    let policy = this.policy();
    model.state = this.requireOneOf(
      model.state || policy.defaultState || "REGISTERED",
      policy.states || ["REGISTERED"],
      "Serialized Stock Unit state",
    );
    model.quantity =
      model.quantity === undefined
        ? policy.quantity || "1"
        : String(model.quantity);
    model.scale = Number(
      model.scale === undefined ? policy.scale || 0 : model.scale,
    );
    if (
      model.quantity !== String(policy.quantity || "1") ||
      model.scale !== Number(policy.scale || 0)
    ) {
      throw this.error(
        "Serialized Stock Unit represents one individual unit; aggregate quantity remains Stock Balance authority",
      );
    }
    return model;
  },
  /** Applies enterprise scope and deterministic identity to a new serialized unit. */
  prepareUnitSave: function (request) {
    if (!request || request._serializedStockUnitMutationAuthorized !== true)
      throw this.error(
        "Serialized Stock Unit state can change only through Inventory serialized-unit policy",
      );
    let model = SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(
      request,
      "serializedUnit",
      ["serializedUnitCode"],
    );
    Object.assign(model, this.validateUnit(model));
    if (!model.registeredAt) model.registeredAt = new Date();
    return model;
  },
};
