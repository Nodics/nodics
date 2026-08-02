/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module commerce/test/commerceOperationsBackofficeNavigationContract
 * @description Protects the backend-driven Axis Commerce Operations navigation model across pricing, inventory, store, cart, and order.
 * @layer test
 * @owner commerce
 * @override Projects may add customer operations navigation in later layers while preserving owning-schema authority and disabled placeholders for missing models.
 */
const assert = require("assert");
const backofficeContractService = require("../../gExp/backoffice/src/service/contract/defaultBackofficeContractService");
const authProperties = require("../../gFramework/nAuth/config/properties");
const userGroups = require("../../gCore/profile/data/init/data/groups/defaultBootstrapUserGroupsData");

global.ENUMS = {
  WorkflowActionType: {
    AUTO: { key: "AUTO" },
    MANUAL: { key: "MANUAL" },
  },
  ReasonType: {
    ORDERSTATUS: { key: "ORDERSTATUS" },
    PAYMENT: { key: "PAYMENT" },
    SHIPMENT: { key: "SHIPMENT" },
  },
};

const pricingCapability = require("../pricing/config/properties")
  .backofficeCapabilities.pricing;
const inventoryCapability = require("../inventory/config/properties")
  .backofficeCapabilities.inventory;
const storeCapability = require("../store/config/properties")
  .backofficeCapabilities.store;
const cartCapability = require("../cart/config/properties")
  .backofficeCapabilities.cart;
const orderCapability = require("../order/config/properties")
  .backofficeCapabilities.order;
const reverseActions = require("../order/data/init/data/reverse/defaultCheckoutReverseWorkflowActionData");

const knownSchemas = {
  pricing: require("../pricing/src/schemas/schemas").pricing,
  inventory: require("../inventory/src/schemas/schemas").inventory,
  store: require("../store/src/schemas/schemas").store,
  cart: require("../cart/src/schemas/schemas").cart,
  order: require("../order/src/schemas/schemas").order,
  fulfillment: require("../fulfillment/src/schemas/schemas").fulfillment,
  payment: require("../payment/src/schemas/schemas").payment,
};
const capabilities = [
  pricingCapability,
  inventoryCapability,
  storeCapability,
  cartCapability,
  orderCapability,
];
const navigation = capabilities.flatMap(
  (capability) => capability.navigation || [],
);
const byId = Object.fromEntries(navigation.map((item) => [item.id, item]));
const schemaHasField = (schema, field) =>
  field === "code" || Boolean(schema.definition[field]);
const disabledIds = [
  "promotions",
  "coupons",
  "store-locations",
  "payments",
  "shipments",
  "returns",
  "refunds",
  "consignments",
  "delivery-modes",
  "payment-modes",
  "tax-records",
  "fraud-checks",
];
const permissionCatalog = authProperties.identityGovernance.permissionCatalog;
const runtimeAdminGroup = Object.values(userGroups).find(
  (group) => group.code === "runtimeConfigAdminUserGroup",
);
const requiredDetailPanelIds = {
  carts: [
    "cart-entries",
    "cart-delivery-groups",
    "cart-delivery-allocations",
    "cart-payment-groups",
    "cart-payment-allocations",
  ],
  orders: [
    "order-entries",
    "order-delivery-groups",
    "order-delivery-allocations",
    "order-payment-groups",
    "order-payment-allocations",
    "order-history",
  ],
  "checkout-reverse-runs": [
    "reverse-run-order",
    "reverse-run-return",
    "reverse-run-refund-transaction",
    "reverse-run-history",
  ],
  pricing: ["price-list-prices", "price-list-assignments"],
  "price-lists": ["price-list-prices", "price-list-assignments"],
  "price-groups": ["price-group-members"],
  "stock-pools": ["stock-pool-members"],
  warehouses: [
    "warehouse-locations",
    "warehouse-stock",
    "warehouse-reservations",
    "warehouse-pool-members",
  ],
  "inventory-promises": ["promise-reservations"],
  reconciliation: ["reconciliation-findings"],
  "sourcing-policies": ["sourcing-rules"],
  stores: ["store-warehouse-assignments"],
};

capabilities.forEach((capability) => {
  assert(
    backofficeContractService.validateBackofficeMetadata(capability),
    capability.capabilityId + " must satisfy the BackOffice metadata contract",
  );
  assert.strictEqual(capability.category, "commerce");
});
assert.strictEqual(
  inventoryCapability.requiredPermissions[0],
  "inventory.operations.read",
  "Inventory BackOffice navigation must reuse the existing bounded operations read permission",
);
assert.strictEqual(
  orderCapability.requiredPermissions,
  undefined,
  "Order contributes Checkout grouping while individual navigation entries carry owner-specific read permissions",
);
assert.strictEqual(
  cartCapability.requiredPermissions,
  undefined,
  "Cart is grouped through Checkout navigation and must not require a separate nav-only permission",
);
assert.strictEqual(cartCapability.navigation.length, 0);
assert.strictEqual(byId["commerce-operations"].route, "/commerce/operations");
assert.strictEqual(byId.pricing.route, "/commerce/operations/pricing");
assert.strictEqual(byId["stock-inventory"].route, "/commerce/operations/stock");
assert.strictEqual(byId.stores.route, "/commerce/operations/stores");
assert.strictEqual(byId.checkout.route, "/commerce/operations/checkout");
["pricing", "stock-inventory", "stores", "checkout"].forEach((id) => {
  assert.strictEqual(byId[id].parentId, "commerce-operations");
  if (id === "pricing") {
    assert.strictEqual(byId[id].parentModuleName, undefined);
  } else {
    assert.strictEqual(byId[id].parentModuleName, "pricing");
  }
});
assert.strictEqual(byId.carts.parentId, "checkout");
assert.strictEqual(byId.carts.workbenchTarget.moduleName, "cart");
assert.strictEqual(byId["cart-entries"].parentId, "checkout");
assert.strictEqual(
  byId["cart-entries"].workbenchTarget.schemaName,
  "cartEntry",
);
assert.strictEqual(
  byId["cart-delivery-groups"].workbenchTarget.schemaName,
  "cartDeliveryGroup",
);
assert.strictEqual(
  byId["cart-delivery-allocations"].workbenchTarget.schemaName,
  "cartDeliveryAllocation",
);
assert.strictEqual(
  byId["cart-payment-groups"].workbenchTarget.schemaName,
  "cartPaymentGroup",
);
assert.strictEqual(
  byId["cart-payment-allocations"].workbenchTarget.schemaName,
  "cartPaymentAllocation",
);
assert.strictEqual(byId.orders.workbenchTarget.schemaName, "order");
assert.strictEqual(byId["order-entries"].parentId, "checkout");
assert.strictEqual(
  byId["order-entries"].workbenchTarget.schemaName,
  "orderEntry",
);
assert.strictEqual(
  byId["order-delivery-groups"].workbenchTarget.schemaName,
  "orderDeliveryGroup",
);
assert.strictEqual(
  byId["order-delivery-allocations"].workbenchTarget.schemaName,
  "orderDeliveryAllocation",
);
assert.strictEqual(
  byId["order-payment-groups"].workbenchTarget.schemaName,
  "orderPaymentGroup",
);
assert.strictEqual(
  byId["order-payment-allocations"].workbenchTarget.schemaName,
  "orderPaymentAllocation",
);
assert.strictEqual(byId["order-history"].parentId, "checkout");
assert.strictEqual(
  byId["order-history"].workbenchTarget.schemaName,
  "orderHistoryEntry",
);
assert.strictEqual(byId["checkout-reverse-runs"].parentId, "checkout");
assert.strictEqual(
  byId["checkout-reverse-runs"].workbenchTarget.schemaName,
  "checkoutReverseRun",
);
assert.deepStrictEqual(
  byId["checkout-reverse-runs"].workbenchPresentation.defaultColumns,
  [
    "reverseCode",
    "orderCode",
    "state",
    "currentStep",
    "recoveryStrategy",
    "recoveryOwner",
    "returnCode",
    "refundTransactionCode",
  ],
);
assert.deepStrictEqual(
  byId["checkout-reverse-runs"].workbenchPresentation.quickFilters.map(
    (filter) => filter.id,
  ),
  [
    "active-recovery",
    "fulfillment-review",
    "inventory-review",
    "payment-retry",
    "history-retry",
  ],
);
assert.deepStrictEqual(
  byId["checkout-reverse-runs"].workbenchPresentation.recoveryActions.map(
    (action) => action.handlerAction,
  ),
  [
    "checkoutReverseRecoverFulfillmentAction",
    "checkoutReverseRecoverInventoryAction",
    "checkoutReverseRecoverPaymentAction",
    "checkoutReverseRecoverHistoryAction",
  ],
);
assert.strictEqual(byId["price-lists"].workbenchTarget.schemaName, "priceList");
assert.strictEqual(byId.prices.workbenchTarget.schemaName, "price");
assert.strictEqual(
  byId["stock-levels"].workbenchTarget.schemaName,
  "stockBalance",
);
assert.strictEqual(
  byId["inventory-promises"].workbenchTarget.schemaName,
  "inventoryPromise",
);
assert.strictEqual(
  byId["promise-reservations"].workbenchTarget.schemaName,
  "inventoryPromiseReservation",
);
assert.strictEqual(byId.warehouses.workbenchTarget.schemaName, "warehouse");
assert.strictEqual(
  byId["warehouse-locations"].workbenchTarget.schemaName,
  "warehouseLocation",
);
assert.strictEqual(
  byId["fulfillment-associations"].workbenchTarget.schemaName,
  "storeWarehouseAssignment",
);
Object.entries(requiredDetailPanelIds).forEach(([id, panelIds]) => {
  const actualIds = (byId[id].detailPanels || []).map((panel) => panel.id);
  panelIds.forEach((panelId) => {
    assert(
      actualIds.includes(panelId),
      id + " must expose backend-driven related panel " + panelId,
    );
  });
});
disabledIds.forEach((id) => {
  assert.strictEqual(
    byId[id].featureState,
    "DISABLED",
    id + " must remain a disabled roadmap placeholder",
  );
  assert.strictEqual(
    byId[id].workbenchTarget,
    undefined,
    id + " must not target a missing backend schema",
  );
});

assert(runtimeAdminGroup, "Runtime admin group must be seeded");
[
  "pricing.backoffice.read",
  "inventory.operations.read",
  "store.backoffice.read",
  "cart.backoffice.read",
  "order.backoffice.read",
].forEach((permission) => {
  assert(
    permissionCatalog.includes(permission),
    permission + " must exist in the root permission catalog",
  );
  assert(
    runtimeAdminGroup.permissions.includes(permission),
    permission + " must be granted to the default runtime admin group",
  );
});

navigation.forEach((item) => {
  assert(
    item.route === "/commerce/operations" ||
      item.route.startsWith("/commerce/operations/"),
    item.id + " must stay in the Commerce Operations route family",
  );
  assert(
    item.group && item.group.id === "commerce",
    item.id + " must remain under the Commerce group",
  );
  assert(
    item.help &&
      item.help.summary.length > 0 &&
      item.help.summary.length <= 320,
    item.id + " must provide bounded backend-owned help text",
  );
  assert(
    item.help.documentationRoute.startsWith("/docs/"),
    item.id + " must link to framework documentation",
  );
  if (item.parentId) {
    if (item.parentModuleName) {
      assert.strictEqual(
        item.parentModuleName,
        "pricing",
        item.id +
          " must only cross-parent to the registered Commerce Operations navigation anchor",
      );
      assert(
        byId[item.parentId],
        item.id + " must reference an existing cross-module parent",
      );
    } else {
      assert(
        byId[item.parentId],
        item.id + " must not reference a missing parent",
      );
    }
  }
  if (item.featureState !== "DISABLED" && item.id !== "commerce-operations") {
    assert(
      item.workbenchTarget,
      item.id + " must declare a schema workbench target",
    );
    assert(
      Array.isArray(item.requiredPermissions) &&
        item.requiredPermissions.length > 0,
      item.id + " must declare permission-gated Axis visibility",
    );
  }
  if (item.workbenchTarget) {
    const moduleSchemas = knownSchemas[item.workbenchTarget.moduleName];
    assert(moduleSchemas, item.id + " must target a known schema module");
    assert(
      moduleSchemas[item.workbenchTarget.schemaName],
      item.id + " must target an implemented backend schema",
    );
  }
  (item.detailPanels || []).forEach((panel) => {
    const sourceSchema = item.workbenchTarget
      ? knownSchemas[item.workbenchTarget.moduleName]?.[
          item.workbenchTarget.schemaName
        ]
      : undefined;
    const targetSchema =
      knownSchemas[panel.target.moduleName]?.[panel.target.schemaName];
    assert(
      targetSchema,
      item.id +
        " detail panel " +
        panel.id +
        " must target an implemented schema",
    );
    if (panel.relation) {
      assert(
        sourceSchema,
        item.id + " detail panel " + panel.id + " must have a source schema",
      );
      assert(
        schemaHasField(sourceSchema, panel.relation.sourceField),
        item.id +
          " detail panel " +
          panel.id +
          " must map from an existing source field",
      );
      assert(
        schemaHasField(targetSchema, panel.relation.targetField),
        item.id +
          " detail panel " +
          panel.id +
          " must map to an existing target field",
      );
    }
  });
  if (item.workbenchPresentation && item.workbenchTarget) {
    const sourceSchema =
      knownSchemas[item.workbenchTarget.moduleName]?.[
        item.workbenchTarget.schemaName
      ];
    (item.workbenchPresentation.defaultColumns || []).forEach((field) => {
      assert(
        schemaHasField(sourceSchema, field),
        item.id + " default column " + field + " must map to schema field",
      );
    });
    (item.workbenchPresentation.quickFilters || []).forEach((filter) => {
      assert(
        schemaHasField(sourceSchema, filter.field),
        item.id + " quick filter " + filter.id + " must map to schema field",
      );
    });
    (item.workbenchPresentation.recoveryActions || []).forEach((action) => {
      assert(
        Object.values(reverseActions).some(
          (workflowAction) => workflowAction.code === action.handlerAction,
        ),
        item.id +
          " recovery action " +
          action.id +
          " must reference seeded Workflow action",
      );
    });
  }
});

console.log("Commerce Operations BackOffice navigation contract validated");
