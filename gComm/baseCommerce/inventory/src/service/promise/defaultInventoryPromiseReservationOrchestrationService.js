/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/service/promise/DefaultInventoryPromiseReservationOrchestrationService @description Reserves and releases Inventory Promise capacity with idempotency, exact quantities, and revision-guarded standard or overbooked counters. @layer service @owner inventory */
module.exports = {
  /** Initializes Inventory Promise Reservation orchestration. */ init: function () {
    return Promise.resolve(true);
  },
  /** Completes initialization. */ postInit: function () {
    return Promise.resolve(true);
  },
  /** Extracts result list. */ items: function (response) {
    return response && Array.isArray(response.result) ? response.result : [];
  },
  /** Extracts affected update count from database adapters. */ affected:
    function (response) {
      let value =
        response && response.result !== undefined ? response.result : response;
      return (
        (value &&
          (value.modifiedCount !== undefined
            ? value.modifiedCount
            : value.nModified !== undefined
              ? value.nModified
              : value.n)) ||
        0
      );
    },
  /** Returns policy configuration. */ policy: function () {
    return (CONFIG.get("inventory") || {}).inventoryPromise || {};
  },
  /** Creates a stable Inventory Promise orchestration error. */ error:
    function (code, message) {
      return new CLASSES.NodicsError(code || "ERR_INV_00048", message);
    },
  /** Negates exact quantity. */ negate: function (value) {
    let parsed = SERVICE.DefaultExactUnitsService.parse(value);
    return SERVICE.DefaultExactUnitsService.format(
      -parsed.unscaled,
      parsed.scale,
    );
  },
  /** Adds exact quantity using the target scale. */ add: function (
    left,
    right,
    scale,
  ) {
    return SERVICE.DefaultExactUnitsService.add(
      left,
      right,
      scale,
      this.policy().roundingMode || "UNNECESSARY",
    );
  },
  /** Loads one Promise by business promiseCode. */
  getPromise: async function (request, promiseCode) {
    let response = await SERVICE.DefaultInventoryPromiseService.get({
      tenant: request.tenant,
      authData: request.authData,
      query: { enterpriseCode: request.enterpriseCode, promiseCode },
      searchOptions: { limit: 1 },
    });
    return this.items(response)[0];
  },
  /** Loads one Promise Reservation by generated primary code. */
  getReservation: async function (request, code) {
    let response = await SERVICE.DefaultInventoryPromiseReservationService.get({
      tenant: request.tenant,
      authData: request.authData,
      query: { enterpriseCode: request.enterpriseCode, code },
      searchOptions: { limit: 1 },
    });
    return this.items(response)[0];
  },
  /** Applies one revision-guarded Promise counter patch. */
  updatePromiseCounters: async function (request, promise, patch) {
    let response = await SERVICE.DefaultInventoryPromiseService.update({
      tenant: request.tenant,
      authData: request.authData,
      _inventoryPromiseMutationAuthorized: true,
      query: {
        enterpriseCode: request.enterpriseCode,
        code: promise.code,
        revision: promise.revision,
      },
      model: Object.assign({}, patch, {
        revision: Number(promise.revision || 0) + 1,
      }),
    });
    if (this.affected(response) !== 1)
      throw this.error("ERR_INV_00049", "Inventory Promise revision conflict");
    return Object.assign({}, promise, patch, {
      revision: Number(promise.revision || 0) + 1,
    });
  },
  /** Returns whether this promise reservation should mutate finite Promise counters. */
  shouldManageCounters: function (promise, evaluation) {
    return (
      promise &&
      promise.counterManaged !== false &&
      (!evaluation || evaluation.counterManaged !== false)
    );
  },
  /** Returns whether an existing reservation matches an idempotent replay. */
  sameReservation: function (reservation, input, quantity) {
    return (
      reservation.promiseCode === input.promiseCode &&
      reservation.demandType === input.demandType &&
      reservation.demandCode === input.demandCode &&
      reservation.demandLineCode === input.demandLineCode &&
      reservation.quantity === quantity
    );
  },
  /** Reserves Promise capacity and records a Promise Reservation through one idempotent operation. */
  reserve: async function (request) {
    request = request || {};
    request.enterpriseCode =
      SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(
        request,
      );
    let input = request.promiseReservation || request.reservation || {};
    [
      "idempotencyKey",
      "promiseCode",
      "demandType",
      "demandCode",
      "demandLineCode",
      "quantity",
    ].forEach((field) => {
      if (!input[field])
        throw this.error(
          "ERR_INV_00048",
          "Inventory Promise Reservation " + field + " is required",
        );
    });
    let reservationCode =
      SERVICE.DefaultInventoryEnterpriseScopeService.buildIdentity(
        request.enterpriseCode,
        "promiseReservation",
        [input.idempotencyKey],
      );
    let existing = await this.getReservation(request, reservationCode);
    if (existing) {
      if (this.sameReservation(existing, input, existing.quantity))
        return existing;
      throw this.error(
        "ERR_INV_00050",
        "Inventory Promise Reservation idempotency conflict",
      );
    }
    let promise = await this.getPromise(request, input.promiseCode);
    if (!promise)
      throw this.error("ERR_INV_00048", "Inventory Promise was not found");
    let evaluation =
      SERVICE.DefaultInventoryPromisePolicyService.evaluatePromiseBucket(
        promise,
        input.quantity,
      );
    let draft =
      SERVICE.DefaultInventoryPromisePolicyService.buildReservationDraft(
        promise,
        Object.assign({}, input, {
          promiseReservationCode: input.idempotencyKey,
          state: input.state || "ACTIVE",
        }),
      );
    SERVICE.DefaultInventoryPromisePolicyService.validateReservationAgainstPromise(
      promise,
      draft,
    );
    if (this.shouldManageCounters(promise, evaluation)) {
      let counterPatch =
        evaluation.bucket === "OVERBOOKED"
          ? {
              overbookedQuantity: this.add(
                promise.overbookedQuantity,
                evaluation.quantity,
                promise.scale,
              ),
            }
          : {
              reservedQuantity: this.add(
                promise.reservedQuantity,
                evaluation.quantity,
                promise.scale,
              ),
            };
      await this.updatePromiseCounters(request, promise, counterPatch);
    }
    await SERVICE.DefaultInventoryPromiseReservationService.save({
      tenant: request.tenant,
      authData: request.authData,
      model: draft,
      _inventoryPromiseMutationAuthorized: true,
    });
    return this.getReservation(request, reservationCode) || draft;
  },
  /** Releases active promise capacity and marks the reservation terminal. */
  release: async function (request) {
    request = request || {};
    request.enterpriseCode =
      SERVICE.DefaultInventoryEnterpriseScopeService.resolveEnterpriseCode(
        request,
      );
    let input = request.promiseReservation || request.reservation || {};
    if (!input.code)
      throw this.error(
        "ERR_INV_00048",
        "Inventory Promise Reservation code is required",
      );
    let reservation = await this.getReservation(request, input.code);
    if (!reservation)
      throw this.error(
        "ERR_INV_00048",
        "Inventory Promise Reservation was not found",
      );
    if (
      ["RELEASED", "CANCELLED", "EXPIRED", "REJECTED"].includes(
        reservation.state,
      )
    )
      return reservation;
    if (!["PENDING", "ACTIVE"].includes(reservation.state))
      throw this.error(
        "ERR_INV_00051",
        "Inventory Promise Reservation cannot be released from current state",
      );
    let promise = await this.getPromise(request, reservation.promiseCode);
    if (!promise)
      throw this.error("ERR_INV_00048", "Inventory Promise was not found");
    if (
      reservation.counterManaged !== false &&
      promise.counterManaged !== false
    ) {
      let counterPatch =
        reservation.promiseBucket === "OVERBOOKED"
          ? {
              overbookedQuantity: this.add(
                promise.overbookedQuantity,
                this.negate(reservation.quantity),
                promise.scale,
              ),
            }
          : {
              reservedQuantity: this.add(
                promise.reservedQuantity,
                this.negate(reservation.quantity),
                promise.scale,
              ),
            };
      SERVICE.DefaultInventoryPromisePolicyService.validatePromise(
        Object.assign({}, promise, counterPatch),
      );
      await this.updatePromiseCounters(request, promise, counterPatch);
    }
    let response =
      await SERVICE.DefaultInventoryPromiseReservationService.update({
        tenant: request.tenant,
        authData: request.authData,
        _inventoryPromiseMutationAuthorized: true,
        query: {
          enterpriseCode: request.enterpriseCode,
          code: reservation.code,
          state: reservation.state,
        },
        model: {
          state: input.state || "RELEASED",
          terminalAt: new Date(),
          reasonCode: input.reasonCode || reservation.reasonCode,
        },
      });
    if (this.affected(response) !== 1)
      throw this.error(
        "ERR_INV_00049",
        "Inventory Promise Reservation revision conflict",
      );
    return Object.assign({}, reservation, {
      state: input.state || "RELEASED",
      terminalAt: new Date(),
      reasonCode: input.reasonCode || reservation.reasonCode,
    });
  },
};
