/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/service/promise/DefaultInventoryPromisePolicyService @description Validates future availability promises, preorder/backorder/overbooking capacity, and checkout demand promise reservations without mutating physical Stock. @layer service @owner inventory */
module.exports = {
  /** Initializes promise policy. */ init: function () {
    return Promise.resolve(true);
  },
  /** Completes initialization. */ postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns configured policy. */ policy: function () {
    return (CONFIG.get("inventory") || {}).inventoryPromise || {};
  },
  /** Builds stable inventory error. */ error: function (message) {
    return new CLASSES.NodicsError("ERR_INV_00047", message);
  },
  /** Returns a configured list. */ list: function (name, fallback) {
    let value = this.policy()[name];
    return Array.isArray(value) && value.length ? value : fallback;
  },
  /** Returns promise-type capacity policy from configuration. */
  typePolicy: function (promiseType) {
    return Object.assign(
      {
        capacityMode: "FINITE",
        counterManaged: true,
        requiresStockEvidence: false,
        provisioningRequired: false,
      },
      (this.policy().promiseTypePolicies || {})[promiseType] || {},
    );
  },
  /** Returns true for promises that do not decrement finite stock counters. */
  isCapacityless: function (promise) {
    return (
      promise &&
      promise.counterManaged === false &&
      ["UNBOUNDED", "ON_DEMAND"].includes(promise.capacityMode)
    );
  },
  /** Negates an exact quantity. */ negate: function (value) {
    let parsed = SERVICE.DefaultExactUnitsService.parse(value);
    return SERVICE.DefaultExactUnitsService.format(
      -parsed.unscaled,
      parsed.scale,
    );
  },
  /** Normalizes a canonical exact quantity to the declared scale and rejects negative values. */
  quantity: function (value, scale, label) {
    let normalized;
    try {
      normalized = SERVICE.DefaultExactUnitsService.multiplyRational(
        value,
        "1",
        "1",
        Number(scale),
        this.policy().roundingMode || "UNNECESSARY",
      );
    } catch (error) {
      throw this.error(
        (label || "Promise quantity") +
          " must be a canonical exact decimal string",
      );
    }
    if (SERVICE.DefaultExactUnitsService.parse(normalized).unscaled < 0n)
      throw this.error((label || "Promise quantity") + " cannot be negative");
    return normalized;
  },
  /** Returns true when left is greater than or equal to right. */
  gte: function (left, right, scale) {
    return (
      SERVICE.DefaultExactUnitsService.parse(
        SERVICE.DefaultExactUnitsService.add(
          left,
          this.negate(right),
          scale,
          "UNNECESSARY",
        ),
      ).unscaled >= 0n
    );
  },
  /** Returns left minus right. */
  subtract: function (left, right, scale) {
    return SERVICE.DefaultExactUnitsService.add(
      left,
      this.negate(right),
      scale,
      "UNNECESSARY",
    );
  },
  /** Validates a configured enum value. */
  requireOneOf: function (value, allowed, label) {
    if (!allowed.includes(value))
      throw this.error(
        label + " is not allowed by inventoryPromise configuration",
      );
    return value;
  },
  /** Allows only generated persistence through this policy service. */
  authorizeMutation: function (request) {
    return request && request._inventoryPromiseMutationAuthorized === true
      ? Promise.resolve(true)
      : Promise.reject(
          this.error(
            "Inventory Promise state can change only through promise policy orchestration",
          ),
        );
  },
  /** Rejects hard deletion of promise evidence. */
  rejectDelete: function () {
    return Promise.reject(
      this.error("Inventory Promise evidence cannot be deleted"),
    );
  },
  /** Applies enterprise scope and validates one promise model before persistence. */
  preparePromiseSave: function (request) {
    let model = SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(
      request,
      "promise",
      ["promiseCode"],
    );
    return Promise.resolve(this.validatePromise(model));
  },
  /** Applies enterprise scope and validates one promise reservation model before persistence. */
  preparePromiseReservationSave: function (request) {
    if (!request || request._inventoryPromiseMutationAuthorized !== true)
      throw this.error(
        "Inventory Promise Reservation state can change only through promise orchestration",
      );
    let model = SERVICE.DefaultInventoryEnterpriseScopeService.scopeNewModel(
      request,
      "promiseReservation",
      ["promiseReservationCode"],
    );
    return Promise.resolve(this.validatePromiseReservation(model));
  },
  /** Validates a promise capacity record without assigning checkout demand. */
  validatePromise: function (model) {
    let policy = this.policy();
    let scale = Number(
      model.scale === undefined ? policy.defaultScale || 6 : model.scale,
    );
    if (
      !Number.isInteger(scale) ||
      scale < 0 ||
      scale > Number(policy.maximumScale || 18)
    )
      throw this.error("Inventory Promise scale is invalid");
    [
      "promiseCode",
      "promiseType",
      "itemType",
      "itemCode",
      "unitCode",
      "state",
    ].forEach((field) => {
      if (!model[field])
        throw this.error("Inventory Promise " + field + " is required");
    });
    this.requireOneOf(
      model.promiseType,
      this.list("promiseTypes", ["STOCK"]),
      "Inventory Promise type",
    );
    this.requireOneOf(
      model.state,
      this.list("states", ["ACTIVE"]),
      "Inventory Promise state",
    );
    let typePolicy = this.typePolicy(model.promiseType);
    model.capacityMode = this.requireOneOf(
      model.capacityMode || typePolicy.capacityMode || "FINITE",
      this.list("capacityModes", ["FINITE"]),
      "Inventory Promise capacity mode",
    );
    if (model.capacityMode !== (typePolicy.capacityMode || "FINITE"))
      throw this.error(
        "Inventory Promise capacityMode must match promiseType policy",
      );
    model.counterManaged =
      model.counterManaged === undefined
        ? typePolicy.counterManaged !== false
        : model.counterManaged;
    model.provisioningRequired =
      model.provisioningRequired === undefined
        ? typePolicy.provisioningRequired === true
        : model.provisioningRequired;
    if (
      model.counterManaged === false &&
      !["UNBOUNDED", "ON_DEMAND"].includes(model.capacityMode)
    )
      throw this.error(
        "Counterless Inventory Promise requires UNBOUNDED or ON_DEMAND capacity mode",
      );
    if (typePolicy.requiresStockEvidence === true && !model.stockCode)
      throw this.error(
        "Stock-backed Inventory Promise requires stockCode evidence",
      );
    if (
      (typePolicy.requireProvisioningPolicy === true ||
        (model.provisioningRequired === true &&
          this.policy().requireProvisioningPolicy === true)) &&
      !model.provisioningPolicyCode
    )
      throw this.error(
        "Provisioned Inventory Promise requires provisioningPolicyCode",
      );
    model.scale = scale;
    model.promisedQuantity = this.quantity(
      model.promisedQuantity,
      scale,
      "Promised quantity",
    );
    model.reservedQuantity = this.quantity(
      model.reservedQuantity || "0",
      scale,
      "Reserved quantity",
    );
    model.overbookingQuantity = this.quantity(
      model.overbookingQuantity || "0",
      scale,
      "Overbooking quantity",
    );
    model.overbookedQuantity = this.quantity(
      model.overbookedQuantity || "0",
      scale,
      "Overbooked quantity",
    );
    if (
      !this.isCapacityless(model) &&
      !this.gte(model.promisedQuantity, model.reservedQuantity, scale)
    )
      throw this.error(
        "Reserved Promise quantity cannot exceed promised quantity",
      );
    if (!this.gte(model.overbookingQuantity, model.overbookedQuantity, scale))
      throw this.error(
        "Overbooked quantity cannot exceed overbooking quantity",
      );
    if (
      model.overbookingAllowed !== true &&
      SERVICE.DefaultExactUnitsService.parse(model.overbookedQuantity)
        .unscaled > 0n
    )
      throw this.error("Overbooked quantity requires overbookingAllowed");
    return model;
  },
  /** Validates a promise reservation model without changing promise counters. */
  validatePromiseReservation: function (model) {
    let policy = this.policy();
    let scale = Number(
      model.scale === undefined ? policy.defaultScale || 6 : model.scale,
    );
    if (
      !Number.isInteger(scale) ||
      scale < 0 ||
      scale > Number(policy.maximumScale || 18)
    )
      throw this.error("Inventory Promise Reservation scale is invalid");
    [
      "promiseReservationCode",
      "idempotencyKey",
      "promiseCode",
      "demandType",
      "demandCode",
      "demandLineCode",
      "promiseBucket",
      "quantity",
      "unitCode",
      "paymentRequirement",
      "state",
    ].forEach((field) => {
      if (!model[field])
        throw this.error(
          "Inventory Promise Reservation " + field + " is required",
        );
    });
    this.requireOneOf(
      model.promiseBucket,
      this.list("promiseBuckets", ["STANDARD", "OVERBOOKED"]),
      "Inventory Promise bucket",
    );
    this.requireOneOf(
      model.paymentRequirement,
      this.list("paymentRequirements", ["NONE"]),
      "Inventory Promise payment requirement",
    );
    this.requireOneOf(
      model.state,
      this.list("reservationStates", ["PENDING"]),
      "Inventory Promise Reservation state",
    );
    if (model.capacityMode)
      this.requireOneOf(
        model.capacityMode,
        this.list("capacityModes", ["FINITE"]),
        "Inventory Promise Reservation capacity mode",
      );
    model.scale = scale;
    model.quantity = this.quantity(
      model.quantity,
      scale,
      "Promise Reservation quantity",
    );
    if (SERVICE.DefaultExactUnitsService.parse(model.quantity).unscaled <= 0n)
      throw this.error("Promise Reservation quantity must be positive");
    return model;
  },
  /** Evaluates whether a request fits standard promise capacity or configured overbooking capacity. */
  evaluatePromiseBucket: function (promise, requestedQuantity) {
    promise = this.validatePromise(Object.assign({}, promise));
    let quantity = this.quantity(
      requestedQuantity,
      promise.scale,
      "Requested Promise quantity",
    );
    if (SERVICE.DefaultExactUnitsService.parse(quantity).unscaled <= 0n)
      throw this.error("Requested Promise quantity must be positive");
    if (this.isCapacityless(promise))
      return {
        bucket: "STANDARD",
        quantity,
        paymentRequirement: "NONE",
        availableQuantity: null,
        capacityMode: promise.capacityMode,
        counterManaged: false,
        provisioningRequired: promise.provisioningRequired,
        provisioningPolicyCode: promise.provisioningPolicyCode,
        providerCode: promise.providerCode,
        commercialPolicyCode: promise.commercialPolicyCode,
      };
    let standardAvailable = this.subtract(
      promise.promisedQuantity,
      promise.reservedQuantity,
      promise.scale,
    );
    if (this.gte(standardAvailable, quantity, promise.scale))
      return {
        bucket: "STANDARD",
        quantity,
        paymentRequirement: "NONE",
        availableQuantity: standardAvailable,
        capacityMode: promise.capacityMode,
        counterManaged: promise.counterManaged,
        provisioningRequired: promise.provisioningRequired,
        provisioningPolicyCode: promise.provisioningPolicyCode,
        providerCode: promise.providerCode,
      };
    if (promise.overbookingAllowed === true) {
      let overbookAvailable = this.subtract(
        promise.overbookingQuantity,
        promise.overbookedQuantity,
        promise.scale,
      );
      if (this.gte(overbookAvailable, quantity, promise.scale)) {
        return {
          bucket: "OVERBOOKED",
          quantity,
          paymentRequirement:
            this.policy().overbookingPaymentRequirement || "ADVANCE",
          availableQuantity: overbookAvailable,
          commercialPolicyCode: promise.commercialPolicyCode,
          capacityMode: promise.capacityMode,
          counterManaged: promise.counterManaged,
          provisioningRequired: promise.provisioningRequired,
          provisioningPolicyCode: promise.provisioningPolicyCode,
          providerCode: promise.providerCode,
        };
      }
    }
    throw this.error(
      "Requested Promise quantity exceeds configured availability and overbooking capacity",
    );
  },
  /** Validates one reservation against an already-loaded promise record. */
  validateReservationAgainstPromise: function (promise, reservation) {
    let expected = this.evaluatePromiseBucket(promise, reservation.quantity);
    this.validatePromiseReservation(reservation);
    if (reservation.promiseCode !== promise.promiseCode)
      throw this.error("Promise Reservation does not match Promise");
    if (reservation.promiseBucket !== expected.bucket)
      throw this.error(
        "Promise Reservation bucket does not match configured capacity",
      );
    if (
      reservation.capacityMode &&
      reservation.capacityMode !== expected.capacityMode
    )
      throw this.error(
        "Promise Reservation capacity mode does not match Promise",
      );
    if (
      expected.bucket === "OVERBOOKED" &&
      reservation.paymentRequirement === "NONE"
    )
      throw this.error(
        "Overbooked Promise Reservation requires a commercial payment requirement",
      );
    return Object.assign({}, reservation, {
      promiseBucket: expected.bucket,
      quantity: expected.quantity,
      commercialPolicyCode:
        reservation.commercialPolicyCode || expected.commercialPolicyCode,
      capacityMode: expected.capacityMode,
      counterManaged: expected.counterManaged,
      provisioningRequired: expected.provisioningRequired,
      provisioningPolicyCode:
        reservation.provisioningPolicyCode || expected.provisioningPolicyCode,
      providerCode: reservation.providerCode || expected.providerCode,
    });
  },
  /** Builds a reservation draft from checkout or order allocation context; persistence is owned by the caller/orchestration layer. */
  buildReservationDraft: function (promise, input) {
    let evaluation = this.evaluatePromiseBucket(promise, input.quantity);
    return this.validatePromiseReservation({
      enterpriseCode: promise.enterpriseCode,
      promiseReservationCode:
        input.promiseReservationCode || input.idempotencyKey,
      idempotencyKey: input.idempotencyKey,
      promiseCode: promise.promiseCode,
      demandType: input.demandType,
      demandCode: input.demandCode,
      demandLineCode: input.demandLineCode,
      checkoutAllocationCode: input.checkoutAllocationCode,
      entryCode: input.entryCode,
      promiseBucket: evaluation.bucket,
      quantity: evaluation.quantity,
      unitCode: promise.unitCode,
      scale: promise.scale,
      paymentRequirement:
        input.paymentRequirement || evaluation.paymentRequirement,
      commercialPolicyCode:
        input.commercialPolicyCode || evaluation.commercialPolicyCode,
      capacityMode: evaluation.capacityMode,
      counterManaged: evaluation.counterManaged,
      provisioningRequired: evaluation.provisioningRequired,
      provisioningPolicyCode:
        input.provisioningPolicyCode || evaluation.provisioningPolicyCode,
      providerCode: input.providerCode || evaluation.providerCode,
      state: input.state || "PENDING",
      expiresAt: input.expiresAt,
      reasonCode: input.reasonCode,
      correlationId: input.correlationId,
    });
  },
};
