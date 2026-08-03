/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates Store schema ownership, private generated boundaries, indexes, and persistence interceptors. */
const assert = require("assert");
const schemas = require("../src/schemas/schemas").store;
const interceptors = require("../src/interceptors/interceptors");

assert.strictEqual(schemas.store.super, "base");
assert.strictEqual(schemas.store.router.enabled, false);
assert.strictEqual(schemas.store.event.enabled, false);
[
  "enterpriseCode",
  "storeCode",
  "name",
  "type",
  "status",
  "countryCode",
  "timezone",
  "addressRef",
  "channels",
  "capabilities",
].forEach((property) =>
  assert(
    schemas.store.definition[property],
    "store." + property + " must exist",
  ),
);
assert.strictEqual(
  schemas.store.indexes.individual.storeCode.options.unique,
  true,
);

assert.strictEqual(schemas.storeWarehouseAssignment.super, "base");
assert.strictEqual(schemas.storeWarehouseAssignment.router.enabled, false);
[
  "enterpriseCode",
  "storeCode",
  "warehouseCode",
  "status",
  "purposes",
  "priority",
  "effectiveFrom",
  "effectiveTo",
].forEach((property) =>
  assert(
    schemas.storeWarehouseAssignment.definition[property],
    "assignment." + property + " must exist",
  ),
);
assert.strictEqual(
  schemas.storeWarehouseAssignment.indexes.individual.warehouseCode.options
    .unique,
  true,
);

assert.strictEqual(schemas.pointOfService.super, "base");
assert.strictEqual(schemas.pointOfService.router.enabled, false);
[
  "enterpriseCode",
  "storeCode",
  "pointOfServiceCode",
  "name",
  "type",
  "status",
  "addressRef",
  "latitude",
  "longitude",
  "timezone",
  "openingHoursPolicy",
  "pickupCapacityMode",
  "maxPickupOrdersPerSlot",
  "slotDurationMinutes",
  "capacityProviderCode",
  "warehouseCode",
  "fulfillmentModeCodes",
  "inventoryReservationPolicyCode",
  "externalReferences",
  "effectiveFrom",
  "effectiveTo",
].forEach((property) =>
  assert(
    schemas.pointOfService.definition[property],
    "pointOfService." + property + " must exist",
  ),
);
assert.strictEqual(schemas.pointOfService.refSchema.storeCode.schema, "store");
assert.strictEqual(
  schemas.pointOfService.refSchema.warehouseCode.module,
  "inventory",
);
assert.strictEqual(
  schemas.pointOfService.refSchema.fulfillmentModeCodes.schema,
  "fulfillmentMode",
);

[
  "storePreSave",
  "storePreGet",
  "storePreUpdate",
  "storePreRemove",
  "storeWarehouseAssignmentPreSave",
  "storeWarehouseAssignmentPreGet",
  "storeWarehouseAssignmentPreUpdate",
  "storeWarehouseAssignmentPreRemove",
  "pointOfServicePreSave",
  "pointOfServicePreGet",
  "pointOfServicePreUpdate",
  "pointOfServicePreRemove",
].forEach((code) =>
  assert(interceptors[code], code + " interceptor must exist"),
);

console.log("Store foundation schema contract validated");
