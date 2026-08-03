/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates serialized stock-unit schema, policy, BackOffice projection, and persistence guards. */
const assert = require("assert");
const inventoryProperties = require("../config/properties").inventory;
const backofficeCapability = require("../config/properties")
  .backofficeCapabilities.inventory;
const schemas = require("../src/schemas/schemas").inventory;
const interceptors = require("../src/interceptors/interceptors");
const operationsService = require("../src/service/operations/defaultInventoryOperationsService");
const serializedPolicy = require("../src/service/serialized/defaultSerializedStockUnitPolicyService");

class NodicsError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}
global.CLASSES = { NodicsError };
global.CONFIG = {
  get: (key) => (key === "inventory" ? inventoryProperties : undefined),
};
global.SERVICE = {};
SERVICE.DefaultInventoryEnterpriseScopeService = require("../src/service/foundation/defaultInventoryEnterpriseScopeService");

const authData = { tokenType: "service", enterprise: { code: "enterpriseA" } };

(async () => {
  assert(
    schemas.serializedStockUnit,
    "Serialized Stock Unit schema must be implemented",
  );
  assert.strictEqual(schemas.serializedStockUnit.service.enabled, true);
  assert.strictEqual(schemas.serializedStockUnit.router.enabled, false);
  assert.strictEqual(
    schemas.serializedStockUnit.refSchema.stockCode.schema,
    "stockBalance",
  );
  assert.strictEqual(
    schemas.serializedStockUnit.refSchema.reservationCode.schema,
    "stockReservation",
  );
  assert.strictEqual(
    schemas.serializedStockUnit.refSchema.allocationCode.schema,
    "stockAllocation",
  );
  assert.strictEqual(
    schemas.serializedStockUnit.definition.quantity.default,
    "1",
  );
  assert.strictEqual(schemas.serializedStockUnit.definition.scale.default, 0);
  assert(inventoryProperties.serializedStockUnit.states.includes("AVAILABLE"));
  assert(
    inventoryProperties.serializedStockUnit.states.includes("QUARANTINED"),
  );
  assert.strictEqual(
    interceptors.serializedStockUnitPreGet.handler,
    "DefaultInventoryEnterpriseScopeService.scopeQuery",
  );
  assert.strictEqual(
    interceptors.serializedStockUnitPreSave.handler,
    "DefaultSerializedStockUnitPolicyService.prepareUnitSave",
  );
  assert.strictEqual(
    interceptors.serializedStockUnitPreRemove.handler,
    "DefaultSerializedStockUnitPolicyService.rejectDelete",
  );

  let prepared = serializedPolicy.prepareUnitSave({
    tenant: "tenantA",
    authData,
    _serializedStockUnitMutationAuthorized: true,
    model: {
      serializedUnitCode: "unit-001",
      serialNumber: "SN-001",
      stockCode:
        "enterpriseA::stock::warehouse-a::none::SKU::phone::none::none::none",
      warehouseCode: "warehouse-a",
      itemType: "SKU",
      itemCode: "phone",
      unitCode: "EA",
      state: "AVAILABLE",
      allocationCode: "allocation-1",
      demandType: "ORDER",
      demandCode: "order-1",
      demandLineCode: "line-1",
    },
  });
  assert.strictEqual(prepared.enterpriseCode, "enterpriseA");
  assert.strictEqual(prepared.code, "enterpriseA::serializedUnit::unit-001");
  assert.strictEqual(prepared.quantity, "1");
  assert.strictEqual(prepared.scale, 0);
  assert(prepared.registeredAt instanceof Date);

  const invalidBase = Object.assign({}, prepared);
  delete invalidBase.code;
  delete invalidBase.registeredAt;
  assert.throws(
    () =>
      serializedPolicy.prepareUnitSave({
        tenant: "tenantA",
        authData,
        _serializedStockUnitMutationAuthorized: true,
        model: Object.assign({}, invalidBase, {
          code: "wrong",
          serializedUnitCode: "unit-002",
          serialNumber: "SN-002",
        }),
      }),
    (error) => error.code === "ERR_INV_00006",
  );
  assert.throws(
    () =>
      serializedPolicy.prepareUnitSave({
        tenant: "tenantA",
        authData,
        _serializedStockUnitMutationAuthorized: true,
        model: Object.assign({}, invalidBase, {
          serializedUnitCode: "unit-003",
          serialNumber: "SN-003",
          quantity: "2",
        }),
      }),
    (error) => error.code === "ERR_INV_00052",
  );
  assert.throws(
    () =>
      serializedPolicy.prepareUnitSave({
        tenant: "tenantA",
        authData,
        _serializedStockUnitMutationAuthorized: true,
        model: Object.assign({}, invalidBase, {
          serializedUnitCode: "unit-004",
          serialNumber: "SN-004",
          state: "UNKNOWN",
        }),
      }),
    (error) => error.code === "ERR_INV_00052",
  );
  await assert.rejects(
    serializedPolicy.authorizeMutation({}),
    (error) => error.code === "ERR_INV_00052",
  );
  await assert.rejects(
    serializedPolicy.rejectDelete(),
    (error) => error.code === "ERR_INV_00052",
  );

  let resources = operationsService.resources();
  assert.strictEqual(
    resources.serializedUnits.service,
    "DefaultSerializedStockUnitService",
  );
  assert(resources.serializedUnits.filters.includes("serialNumber"));
  assert(resources.serializedUnits.fields.includes("allocationCode"));

  let serializedNavigation = backofficeCapability.navigation.find(
    (item) => item.id === "serialized-units",
  );
  assert(
    serializedNavigation,
    "Serialized Units must be visible through backend-driven Axis metadata",
  );
  assert.strictEqual(
    serializedNavigation.workbenchTarget.schemaName,
    "serializedStockUnit",
  );
  assert(
    serializedNavigation.workbenchPresentation.defaultColumns.includes(
      "serialNumber",
    ),
  );
  assert(
    serializedNavigation.workbenchPresentation.detailSections.some(
      (section) => section.id === "demand-links",
    ),
  );
  let stockLevels = backofficeCapability.navigation.find(
    (item) => item.id === "stock-levels",
  );
  assert(
    stockLevels.detailPanels.some(
      (panel) => panel.target.schemaName === "serializedStockUnit",
    ),
  );
  console.log("Inventory Serialized Stock Unit foundation validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
