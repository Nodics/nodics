/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates Store enterprise isolation, lifecycle, Inventory references, boundaries, and layered customization. */
const assert = require("assert");
const properties = require("../config/properties").store;
class NodicsError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}
global.CLASSES = { NodicsError };
global.CONFIG = { get: (key) => (key === "store" ? properties : undefined) };
global.SERVICE = {};

const scope = require("../src/service/foundation/defaultStoreEnterpriseScopeService");
const storeService = require("../src/service/foundation/defaultStoreFoundationService");
const assignmentService = require("../src/service/foundation/defaultStoreWarehouseAssignmentFoundationService");
const pointOfServiceService = require("../src/service/foundation/defaultPointOfServiceFoundationService");
const warehouseReferenceProvider = require("../src/service/reference/defaultStoreWarehouseReferenceProviderService");
SERVICE.DefaultStoreEnterpriseScopeService = scope;
SERVICE.DefaultStoreWarehouseReferenceProviderService =
  warehouseReferenceProvider;
const auth = { enterprise: { code: "enterpriseA" } };
const request = (model) => ({
  tenant: "tenantA",
  authData: auth,
  model: Object.assign({}, model),
});

assert.throws(
  () => scope.resolveEnterpriseCode({ authData: {} }),
  (error) => error.code === "ERR_STORE_00001",
);
assert.throws(
  () =>
    scope.scopeQuery({
      authData: auth,
      query: { enterpriseCode: "enterpriseB" },
    }),
  (error) => error.code === "ERR_STORE_00002",
);

(async () => {
  let create = request({ storeCode: "dubaiMall", name: "Dubai Mall" });
  await storeService.prepareStoreSave(create);
  assert.strictEqual(create.model.code, "enterpriseA::store::dubaiMall");
  assert.strictEqual(create.model.type, "PHYSICAL");
  assert.strictEqual(create.model.status, "DRAFT");
  assert.throws(
    () =>
      storeService.prepareStoreSave(
        request({ storeCode: "bad code", name: "Bad" }),
      ),
    (error) => error.code === "ERR_STORE_00003",
  );

  properties.store.types.push("MOBILE_STORE");
  let customized = request({
    storeCode: "mobileOne",
    name: "Mobile",
    type: "MOBILE_STORE",
  });
  await storeService.prepareStoreSave(customized);
  assert.strictEqual(customized.model.type, "MOBILE_STORE");
  properties.store.types.pop();

  let stores = [
    {
      code: create.model.code,
      enterpriseCode: "enterpriseA",
      storeCode: "dubaiMall",
      name: "Dubai Mall",
      type: "PHYSICAL",
      status: "ACTIVE",
    },
  ];
  let warehouses = [
    {
      enterpriseCode: "enterpriseA",
      warehouseCode: "central",
      status: "ACTIVE",
    },
  ];
  let assignments = [];
  let pointsOfService = [];
  const matches = (item, query) =>
    Object.keys(query || {}).every((key) => {
      let expected = query[key];
      if (expected && expected.$ne !== undefined)
        return item[key] !== expected.$ne;
      return item[key] === expected;
    });
  SERVICE.DefaultStoreService = {
    get: async (input) => ({
      result: stores.filter((item) => matches(item, input.query)),
    }),
  };
  SERVICE.DefaultWarehouseService = {
    get: async (input) => ({
      result: warehouses.filter((item) => matches(item, input.query)),
    }),
  };
  SERVICE.DefaultStoreWarehouseAssignmentService = {
    get: async (input) => ({
      result: assignments.filter((item) => matches(item, input.query)),
    }),
  };
  SERVICE.DefaultPointOfServiceService = {
    get: async (input) => ({
      result: pointsOfService.filter((item) => matches(item, input.query)),
    }),
  };

  let assignment = request({
    storeCode: "dubaiMall",
    warehouseCode: "central",
    purposes: ["FULFILLMENT", "PICKUP"],
    priority: 10,
  });
  await assignmentService.prepareAssignmentSave(assignment);
  assert.strictEqual(
    assignment.model.code,
    "enterpriseA::storeWarehouse::dubaiMall::central",
  );
  assert.strictEqual(assignment.model.status, "DRAFT");

  await assert.rejects(
    assignmentService.prepareAssignmentSave(
      request({
        storeCode: "dubaiMall",
        warehouseCode: "missing",
        purposes: ["FULFILLMENT"],
      }),
    ),
    (error) => error.code === "ERR_STORE_00005",
  );
  await assert.rejects(
    assignmentService.prepareAssignmentSave(
      request({
        storeCode: "dubaiMall",
        warehouseCode: "central",
        purposes: ["UNKNOWN"],
      }),
    ),
    (error) => error.code === "ERR_STORE_00003",
  );
  await assert.rejects(
    assignmentService.prepareAssignmentSave(
      request({
        storeCode: "dubaiMall",
        warehouseCode: "central",
        purposes: ["FULFILLMENT"],
        priority: -1,
      }),
    ),
    (error) => error.code === "ERR_STORE_00003",
  );

  properties.warehouseAssignment.purposes.push("SERVICE");
  let customPurpose = request({
    storeCode: "dubaiMall",
    warehouseCode: "central",
    purposes: ["SERVICE"],
  });
  await assignmentService.prepareAssignmentSave(customPurpose);
  properties.warehouseAssignment.purposes.pop();

  let pos = request({
    storeCode: "dubaiMall",
    pointOfServiceCode: "pickupDesk",
    name: "Pickup Desk",
    type: "PICKUP_COUNTER",
    pickupCapacityMode: "SLOT_COUNT",
    maxPickupOrdersPerSlot: 25,
    slotDurationMinutes: 30,
    warehouseCode: "central",
    fulfillmentModeCodes: ["PICKUP"],
    latitude: "25.197200",
    longitude: "55.274400",
  });
  await pointOfServiceService.preparePointOfServiceSave(pos);
  assert.strictEqual(pos.model.code, "enterpriseA::pos::dubaiMall::pickupDesk");
  assert.strictEqual(pos.model.status, "DRAFT");
  assert.strictEqual(pos.model.fulfillmentModeCodes[0], "PICKUP");
  await assert.rejects(
    pointOfServiceService.preparePointOfServiceSave(
      request({
        storeCode: "dubaiMall",
        pointOfServiceCode: "badGeo",
        name: "Bad Geo",
        latitude: "91",
        longitude: "55",
      }),
    ),
    (error) => error.code === "ERR_STORE_00003",
  );
  await assert.rejects(
    pointOfServiceService.preparePointOfServiceSave(
      request({
        storeCode: "dubaiMall",
        pointOfServiceCode: "slotMissing",
        name: "Slot Missing",
        pickupCapacityMode: "SLOT_COUNT",
      }),
    ),
    (error) => error.code === "ERR_STORE_00003",
  );
  await assert.rejects(
    pointOfServiceService.preparePointOfServiceSave(
      request({
        storeCode: "dubaiMall",
        pointOfServiceCode: "badMode",
        name: "Bad Mode",
        fulfillmentModeCodes: ["DRONE"],
      }),
    ),
    (error) => error.code === "ERR_STORE_00003",
  );
  pointsOfService.push(Object.assign({}, pos.model, { status: "ACTIVE" }));
  let posUpdate = {
    tenant: "tenantA",
    authData: auth,
    query: { storeCode: "dubaiMall", pointOfServiceCode: "pickupDesk" },
    model: { status: "SUSPENDED" },
  };
  await pointOfServiceService.preparePointOfServiceUpdate(posUpdate);
  assert.strictEqual(posUpdate.model.enterpriseCode, "enterpriseA");
  await assert.rejects(
    pointOfServiceService.preparePointOfServiceUpdate({
      tenant: "tenantA",
      authData: auth,
      query: { storeCode: "dubaiMall", pointOfServiceCode: "pickupDesk" },
      model: { pointOfServiceCode: "renamed" },
    }),
    (error) => error.code === "ERR_STORE_00006",
  );

  assignments.push(Object.assign({}, assignment.model, { status: "ACTIVE" }));
  let retireStore = {
    tenant: "tenantA",
    authData: auth,
    query: { storeCode: "dubaiMall" },
    model: { status: "RETIRED" },
  };
  await assert.rejects(
    storeService.prepareStoreUpdate(retireStore),
    (error) => error.code === "ERR_STORE_00008",
  );
  let identityChange = {
    tenant: "tenantA",
    authData: auth,
    query: { storeCode: "dubaiMall" },
    model: { storeCode: "renamed" },
  };
  await assert.rejects(
    storeService.prepareStoreUpdate(identityChange),
    (error) => error.code === "ERR_STORE_00006",
  );
  let invalidAssignmentTransition = {
    tenant: "tenantA",
    authData: auth,
    query: { storeCode: "dubaiMall", warehouseCode: "central" },
    model: { status: "DRAFT" },
  };
  await assert.rejects(
    assignmentService.prepareAssignmentUpdate(invalidAssignmentTransition),
    (error) => error.code === "ERR_STORE_00004",
  );

  warehouses[0].enterpriseCode = "enterpriseB";
  await assert.rejects(
    assignmentService.prepareAssignmentSave(
      request({
        storeCode: "dubaiMall",
        warehouseCode: "central",
        purposes: ["FULFILLMENT"],
      }),
    ),
    (error) => error.code === "ERR_STORE_00005",
  );

  await assert.rejects(
    storeService.rejectHardDelete(),
    (error) => error.code === "ERR_STORE_00007",
  );
  await assert.rejects(
    assignmentService.rejectHardDelete(),
    (error) => error.code === "ERR_STORE_00007",
  );
  await assert.rejects(
    pointOfServiceService.rejectHardDelete(),
    (error) => error.code === "ERR_STORE_00007",
  );
  console.log("Store foundation service validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
