/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module store/service/foundation/DefaultPointOfServiceFoundationService
 * @description Validates Store-owned Point of Service identity, pickup capacity policy, geolocation metadata, and safe Store/Warehouse/Fulfillment references.
 * @layer service
 * @owner store
 * @override Customer modules may extend Point of Service types, capacity policy, opening-hours policy, or provider references while preserving Store ownership and external authority boundaries.
 */
module.exports = {
  /** Initializes Point of Service validation. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes Point of Service validation initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Returns effective Point of Service policy. */
  policy: function () {
    return (CONFIG.get("store") || {}).pointOfService || {};
  },
  /** Extracts generated-service result items. */
  items: function (response) {
    return response && Array.isArray(response.result) ? response.result : [];
  },
  /** Loads one non-retired Store in authenticated enterprise scope. */
  loadStore: async function (request, storeCode) {
    const response = await SERVICE.DefaultStoreService.get({
      tenant: request.tenant,
      authData: request.authData,
      query: { storeCode: storeCode },
      searchOptions: { limit: 2 },
    });
    const items = this.items(response);
    if (items.length !== 1 || items[0].status === "RETIRED") {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00005",
        "Point of Service requires one non-retired store in the authenticated enterprise",
      );
    }
    return items[0];
  },
  /** Loads one Inventory Warehouse when a Point of Service declares pickup sourcing. */
  loadWarehouse: async function (request, warehouseCode) {
    if (!warehouseCode) return undefined;
    return SERVICE.DefaultStoreWarehouseReferenceProviderService.resolve(
      request,
      warehouseCode,
    );
  },
  /** Validates exact-string latitude and longitude bounds when supplied. */
  validateGeoPoint: function (model) {
    const latitude = model.latitude;
    const longitude = model.longitude;
    if ((latitude === undefined) !== (longitude === undefined)) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service latitude and longitude must be supplied together",
      );
    }
    if (latitude === undefined) return true;
    if (
      !/^-?\d{1,2}(\.\d{1,12})?$/.test(String(latitude)) ||
      !/^-?\d{1,3}(\.\d{1,12})?$/.test(String(longitude))
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service geolocation must use bounded exact decimal strings",
      );
    }
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service geolocation is outside valid bounds",
      );
    }
    return true;
  },
  /** Validates lifecycle, type, capacity, fulfillment-mode, and effective-date policy. */
  validateModel: function (model) {
    const policy = this.policy();
    if (
      !(policy.statuses || []).includes(model.status || "DRAFT") ||
      !(policy.types || []).includes(model.type || "PICKUP_COUNTER") ||
      !(policy.pickupCapacityModes || []).includes(
        model.pickupCapacityMode || "UNLIMITED",
      )
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service status, type, or capacity mode is not allowed by configuration",
      );
    }
    const modes = model.fulfillmentModeCodes || [];
    if (
      !Array.isArray(modes) ||
      modes.some((mode) => !(policy.fulfillmentModeCodes || []).includes(mode))
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service fulfillment mode is not allowed by configuration",
      );
    }
    const slotDuration = model.slotDurationMinutes;
    if (
      slotDuration !== undefined &&
      (!Number.isInteger(slotDuration) ||
        slotDuration < Number(policy.minimumSlotDurationMinutes || 5) ||
        slotDuration > Number(policy.maximumSlotDurationMinutes || 1440))
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service slot duration is outside the configured range",
      );
    }
    const maxOrders = model.maxPickupOrdersPerSlot;
    if (
      maxOrders !== undefined &&
      (!Number.isInteger(maxOrders) ||
        maxOrders < Number(policy.minimumPickupOrdersPerSlot || 0) ||
        maxOrders > Number(policy.maximumPickupOrdersPerSlot || 999999))
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service pickup capacity is outside the configured range",
      );
    }
    if (
      (model.pickupCapacityMode || "UNLIMITED") === "SLOT_COUNT" &&
      maxOrders === undefined
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Slot-count Point of Service capacity requires maxPickupOrdersPerSlot",
      );
    }
    if (
      model.effectiveFrom &&
      model.effectiveTo &&
      new Date(model.effectiveFrom).getTime() >
        new Date(model.effectiveTo).getTime()
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service effective-from date must not follow effective-to date",
      );
    }
    this.validateGeoPoint(model);
    return true;
  },
  /** Validates endpoints and prepares a new Point of Service for persistence. */
  preparePointOfServiceSave: async function (request) {
    SERVICE.DefaultStoreEnterpriseScopeService.scopeNewModel(request, "pos", [
      "storeCode",
      "pointOfServiceCode",
    ]);
    request.model.type = request.model.type || "PICKUP_COUNTER";
    request.model.status = request.model.status || "DRAFT";
    request.model.pickupCapacityMode =
      request.model.pickupCapacityMode || "UNLIMITED";
    request.model.fulfillmentModeCodes =
      request.model.fulfillmentModeCodes || [];
    this.validateModel(request.model);
    const store = await this.loadStore(request, request.model.storeCode);
    const warehouse = await this.loadWarehouse(
      request,
      request.model.warehouseCode,
    );
    if (
      store.enterpriseCode !== request.model.enterpriseCode ||
      (warehouse && warehouse.enterpriseCode !== request.model.enterpriseCode)
    ) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00002",
        "Point of Service references must belong to the authenticated enterprise",
      );
    }
    return true;
  },
  /** Loads exactly one Point of Service selected by a scoped update. */
  loadExisting: async function (request) {
    await SERVICE.DefaultStoreEnterpriseScopeService.scopeQuery(request);
    const response = await SERVICE.DefaultPointOfServiceService.get({
      tenant: request.tenant,
      authData: request.authData,
      query: Object.assign({}, request.query),
      searchOptions: { limit: 2 },
    });
    const items = this.items(response);
    if (items.length !== 1) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00003",
        "Point of Service update must identify one existing record",
      );
    }
    return items[0];
  },
  /** Validates a configured Point of Service lifecycle transition. */
  validateTransition: function (from, to) {
    if (!to || to === from) return true;
    if (!((this.policy().allowedTransitions || {})[from] || []).includes(to)) {
      throw SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00004",
        "Point of Service transition from " +
          from +
          " to " +
          to +
          " is not allowed",
      );
    }
    return true;
  },
  /** Prepares one governed Point of Service update. */
  preparePointOfServiceUpdate: async function (request) {
    const existing = await this.loadExisting(request);
    const patch =
      (request.model && (request.model.$set || request.model)) || {};
    ["code", "enterpriseCode", "storeCode", "pointOfServiceCode"].forEach(
      (property) => {
        if (
          patch[property] !== undefined &&
          patch[property] !== existing[property]
        ) {
          throw SERVICE.DefaultStoreEnterpriseScopeService.error(
            "ERR_STORE_00006",
            "Point of Service identity property " + property + " is immutable",
          );
        }
      },
    );
    const candidate = Object.assign({}, existing, patch);
    this.validateModel(candidate);
    this.validateTransition(existing.status, candidate.status);
    if (patch.warehouseCode !== undefined) {
      const warehouse = await this.loadWarehouse(request, patch.warehouseCode);
      if (warehouse && warehouse.enterpriseCode !== existing.enterpriseCode) {
        throw SERVICE.DefaultStoreEnterpriseScopeService.error(
          "ERR_STORE_00002",
          "Point of Service warehouse must belong to the authenticated enterprise",
        );
      }
    }
    patch.enterpriseCode = existing.enterpriseCode;
    return true;
  },
  /** Rejects destructive Point of Service deletion. */
  rejectHardDelete: function () {
    return Promise.reject(
      SERVICE.DefaultStoreEnterpriseScopeService.error(
        "ERR_STORE_00007",
        "Points of Service must be retired instead of deleted",
      ),
    );
  },
};
