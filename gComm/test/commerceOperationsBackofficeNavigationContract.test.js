/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module commerce/test/commerceOperationsBackofficeNavigationContract
 * @description Protects the backend-driven Axis Commerce Operations navigation model across pricing, inventory, store, cart, order, tax, payment, and fulfillment.
 * @layer test
 * @owner commerce
 * @override Projects may add customer operations navigation in later layers while preserving owning-schema authority and disabled placeholders for missing models.
 */
const assert = require("assert");
const backofficeContractService = require("../../gExp/backoffice/src/service/contract/defaultBackofficeContractService");
const authProperties = require("../../gFramework/nAuth/config/properties");
const databaseSchemas = require("../../gFramework/nDatabase/database/src/schemas/schemas");
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

const cartSchemas = require("../checkout/cart/src/schemas/schemas");
const pricingCapability = require("../baseCommerce/pricing/config/properties")
  .backofficeCapabilities.pricing;
const inventoryCapability = require("../baseCommerce/inventory/config/properties")
  .backofficeCapabilities.inventory;
const storeCapability = require("../baseCommerce/store/config/properties")
  .backofficeCapabilities.store;
const cartCapability = require("../checkout/cart/config/properties")
  .backofficeCapabilities.cart;
const orderCapability = require("../checkout/order/config/properties")
  .backofficeCapabilities.order;
const paymentCapability = require("../payment/paymentCore/config/properties")
  .backofficeCapabilities.payment;
const taxCapability = require("../baseCommerce/tax/config/properties").backofficeCapabilities
  .tax;
const promotionCapability = require("../baseCommerce/promotion/config/properties")
  .backofficeCapabilities.promotion;
const fulfillmentCapability = require("../fulfillment/fulfillmentCore/config/properties")
  .backofficeCapabilities.fulfillment;
const reverseActions = require("../checkout/order/data/init/data/reverse/defaultCheckoutReverseWorkflowActionData");

const knownSchemas = {
  pricing: require("../baseCommerce/pricing/src/schemas/schemas").pricing,
  inventory: require("../baseCommerce/inventory/src/schemas/schemas").inventory,
  store: require("../baseCommerce/store/src/schemas/schemas").store,
  cart: cartSchemas.cart,
  order: require("../checkout/order/src/schemas/schemas").order,
  fulfillment: require("../fulfillment/fulfillmentCore/src/schemas/schemas").fulfillment,
  payment: require("../payment/paymentCore/src/schemas/schemas").payment,
  promotion: require("../baseCommerce/promotion/src/schemas/schemas").promotion,
  tax: require("../baseCommerce/tax/src/schemas/schemas").tax,
};
const inheritedSchemas = {
  abstractCartEntry: cartSchemas.default.abstractCartEntry,
  base: databaseSchemas.default.base,
  super: databaseSchemas.default.super,
};
const capabilities = [
  pricingCapability,
  inventoryCapability,
  storeCapability,
  cartCapability,
  orderCapability,
  taxCapability,
  promotionCapability,
  paymentCapability,
  fulfillmentCapability,
];
const navigation = capabilities.flatMap(
  (capability) => capability.navigation || [],
);
const byId = Object.fromEntries(navigation.map((item) => [item.id, item]));
const schemaHasField = (schema, field) =>
  field === "code" ||
  Boolean(schema.definition[field]) ||
  Boolean(inheritedSchemas[schema.super]?.definition[field]) ||
  Boolean(
    inheritedSchemas[inheritedSchemas[schema.super]?.super]?.definition[field],
  );
const disabledIds = ["delivery-modes", "tax-records", "fraud-checks"];
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
  promotions: ["promotion-rules", "coupon-campaigns"],
  "promotion-rules": ["promotion-conditions", "promotion-actions"],
  coupons: ["coupon-codes"],
  "promotion-evaluations": ["applied-promotions"],
  "stock-pools": ["stock-pool-members"],
  "stock-levels": ["serialized-units"],
  allocations: ["serialized-units"],
  warehouses: [
    "warehouse-locations",
    "warehouse-stock",
    "warehouse-reservations",
    "warehouse-pool-members",
  ],
  "inventory-promises": ["promise-reservations"],
  reconciliation: ["reconciliation-findings"],
  "sourcing-policies": ["sourcing-rules"],
  stores: ["store-warehouse-assignments", "points-of-service"],
  tax: ["jurisdiction-rates", "jurisdiction-exemptions"],
  "tax-quotes": ["tax-quote-lines"],
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
assert.strictEqual(byId["payment-operations"].route, "/commerce/payments");
assert.strictEqual(byId.pricing.route, "/commerce/operations/pricing");
assert.strictEqual(byId.promotions.route, "/commerce/operations/promotions");
assert.strictEqual(byId["stock-inventory"].route, "/commerce/operations/stock");
assert.strictEqual(byId.stores.route, "/commerce/operations/stores");
assert.strictEqual(byId.checkout.route, "/commerce/operations/checkout");
assert.strictEqual(byId.tax.route, "/commerce/operations/tax");
[
  "pricing",
  "promotions",
  "stock-inventory",
  "stores",
  "checkout",
  "tax",
].forEach((id) => {
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
assert.deepStrictEqual(
  byId["cart-entries"].workbenchPresentation.defaultColumns,
  [
    "entryCode",
    "cartCode",
    "itemCode",
    "quantity",
    "unitCode",
    "currencyCode",
    "lineGrossAmount",
    "taxTotal",
    "taxInclusionMode",
    "status",
  ],
);
assert.deepStrictEqual(
  byId["cart-entries"].workbenchPresentation.detailSections.map(
    (section) => section.id,
  ),
  ["entry-identity", "price-tax-display", "tax-authority-links"],
);
assert.strictEqual(
  byId.promotions.workbenchTarget.schemaName,
  "promotionCampaign",
);
assert.strictEqual(
  byId["promotion-rules"].workbenchTarget.schemaName,
  "promotionRule",
);
assert.deepStrictEqual(
  byId["promotion-rules"].workbenchPresentation.defaultColumns,
  [
    "ruleCode",
    "campaignCode",
    "ruleType",
    "priority",
    "couponRequired",
    "exclusive",
    "status",
  ],
);
assert.strictEqual(byId.coupons.workbenchTarget.schemaName, "couponCampaign");
assert.strictEqual(
  byId["coupon-codes"].workbenchTarget.schemaName,
  "couponCode",
);
assert.strictEqual(
  byId["promotion-evaluations"].workbenchTarget.schemaName,
  "promotionEvaluationRun",
);
assert.strictEqual(
  byId["applied-promotions"].workbenchTarget.schemaName,
  "appliedPromotion",
);
assert.deepStrictEqual(
  byId["applied-promotions"].workbenchPresentation.defaultColumns,
  [
    "appliedPromotionCode",
    "ruleCode",
    "sourceType",
    "targetType",
    "discountAmount",
    "currencyCode",
    "taxTreatment",
    "status",
  ],
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
assert.deepStrictEqual(
  byId["order-entries"].workbenchPresentation.defaultColumns,
  [
    "entryCode",
    "orderCode",
    "itemCode",
    "quantity",
    "unitCode",
    "currencyCode",
    "lineGrossAmount",
    "taxTotal",
    "taxInclusionMode",
    "status",
  ],
);
assert.deepStrictEqual(
  byId["order-entries"].workbenchPresentation.detailSections.map(
    (section) => section.id,
  ),
  [
    "entry-identity",
    "frozen-price-tax-evidence",
    "tax-authority-links",
    "inventory-links",
  ],
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
assert.strictEqual(byId.tax.workbenchTarget.moduleName, "tax");
assert.strictEqual(byId.tax.workbenchTarget.schemaName, "taxJurisdiction");
assert.strictEqual(
  byId["tax-jurisdictions"].workbenchTarget.schemaName,
  "taxJurisdiction",
);
assert.strictEqual(byId["tax-rates"].workbenchTarget.schemaName, "taxRate");
assert.strictEqual(
  byId["tax-exemptions"].workbenchTarget.schemaName,
  "taxExemption",
);
assert.strictEqual(
  byId["tax-providers"].workbenchTarget.schemaName,
  "taxProvider",
);
assert.strictEqual(byId["tax-quotes"].workbenchTarget.schemaName, "taxQuote");
assert.deepStrictEqual(
  byId["tax-quotes"].workbenchPresentation.defaultColumns,
  [
    "quoteCode",
    "providerCode",
    "jurisdictionCode",
    "currencyCode",
    "subtotalAmount",
    "taxTotal",
    "taxInclusionMode",
    "status",
  ],
);
assert.strictEqual(
  byId["tax-quote-lines"].workbenchTarget.schemaName,
  "taxQuoteLine",
);
assert.deepStrictEqual(
  byId["tax-quote-lines"].workbenchPresentation.defaultColumns,
  [
    "lineCode",
    "quoteCode",
    "entryCode",
    "taxCategoryCode",
    "jurisdictionCode",
    "rateCode",
    "grossAmount",
    "taxAmount",
    "taxInclusionMode",
  ],
);
assert.strictEqual(
  byId["delivery-charge-quotes"].workbenchTarget.schemaName,
  "deliveryChargeQuote",
);
assert.deepStrictEqual(
  byId["delivery-charge-quotes"].workbenchPresentation.defaultColumns,
  [
    "quoteCode",
    "deliveryModeCode",
    "amount",
    "currencyCode",
    "status",
    "validUntil",
  ],
);
assert.strictEqual(
  byId["stock-levels"].workbenchTarget.schemaName,
  "stockBalance",
);
assert.strictEqual(
  byId["inventory-promises"].workbenchTarget.schemaName,
  "inventoryPromise",
);
assert.deepStrictEqual(
  byId["inventory-promises"].workbenchPresentation.defaultColumns,
  [
    "promiseCode",
    "promiseType",
    "capacityMode",
    "itemCode",
    "promisedQuantity",
    "reservedQuantity",
    "provisioningRequired",
    "state",
  ],
);
assert.strictEqual(
  byId["serialized-units"].workbenchTarget.schemaName,
  "serializedStockUnit",
);
assert.deepStrictEqual(
  byId["serialized-units"].workbenchPresentation.defaultColumns,
  [
    "serializedUnitCode",
    "serialNumber",
    "itemCode",
    "warehouseCode",
    "state",
    "reservationCode",
    "allocationCode",
  ],
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
assert.strictEqual(byId["store-locations"].parentId, "stores");
assert.strictEqual(
  byId["store-locations"].workbenchTarget.schemaName,
  "pointOfService",
);
assert.strictEqual(byId["store-locations"].featureState, "PREVIEW");
assert.strictEqual(byId["payment-methods"].parentId, "payment-operations");
assert.strictEqual(
  byId["payment-methods"].workbenchTarget.schemaName,
  "paymentMethod",
);
assert.strictEqual(byId["payment-providers"].parentId, "payment-operations");
assert.strictEqual(
  byId["payment-providers"].workbenchTarget.schemaName,
  "paymentProvider",
);
assert.strictEqual(
  byId["payment-provider-policies"].parentId,
  "payment-operations",
);
assert.strictEqual(
  byId["payment-provider-policies"].workbenchTarget.schemaName,
  "paymentProviderExecutionPolicy",
);
assert.strictEqual(byId["payment-transactions"].parentId, "payment-operations");
assert.strictEqual(
  byId["payment-transactions"].workbenchTarget.schemaName,
  "paymentTransaction",
);
assert.strictEqual(
  byId["payment-refunds-reconciliation"].workbenchTarget.schemaName,
  "paymentTransaction",
);
assert.deepStrictEqual(
  byId["payment-refunds-reconciliation"].workbenchPresentation.quickFilters.map(
    (filter) => filter.id,
  ),
  ["refunds", "reconciliation", "recoverable"],
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
  "tax.backoffice.read",
  "tax.backoffice.manage",
  "payment.backoffice.read",
  "payment.backoffice.manage",
  "fulfillment.backoffice.read",
  "fulfillment.backoffice.manage",
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
      item.route.startsWith("/commerce/operations/") ||
      item.route === "/commerce/payments" ||
      item.route.startsWith("/commerce/payments/") ||
      item.route === "/commerce/shipping" ||
      item.route.startsWith("/commerce/shipping/"),
    item.id + " must stay in the Commerce or Payment Operations route family",
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
  if (
    item.route === "/commerce/operations/tax" ||
    item.route.startsWith("/commerce/operations/tax/")
  ) {
    assert(
      item.requiredPermissions.includes("tax.backoffice.read"),
      item.id + " must be visibility-gated by Tax BackOffice read permission",
    );
  }
  if (
    item.route === "/commerce/payments" ||
    item.route.startsWith("/commerce/payments/")
  ) {
    assert(
      item.requiredPermissions.includes("payment.backoffice.read"),
      item.id +
        " must be visibility-gated by Payment BackOffice read permission",
    );
  }
  if (
    item.route === "/commerce/shipping" ||
    item.route.startsWith("/commerce/shipping/")
  ) {
    assert(
      item.requiredPermissions.includes("fulfillment.backoffice.read"),
      item.id +
        " must be visibility-gated by Fulfillment BackOffice read permission",
    );
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
    ["hiddenFields", "editableFields", "readonlyFields"].forEach(
      (collectionName) => {
        (item.workbenchPresentation[collectionName] || []).forEach((field) => {
          assert(
            schemaHasField(sourceSchema, field),
            item.id +
              " " +
              collectionName +
              " field " +
              field +
              " must map to schema field",
          );
        });
      },
    );
    (item.workbenchPresentation.detailSections || []).forEach((section) => {
      section.fields.forEach((field) => {
        assert(
          schemaHasField(sourceSchema, field),
          item.id +
            " detail section " +
            section.id +
            " field " +
            field +
            " must map to schema field",
        );
      });
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
