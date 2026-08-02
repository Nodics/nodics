/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/checkoutOrderProjectionServiceContract
 * @description Protects checkout order projection as an Order-owned Workflow action that creates traceable Order header and Entries from validated Cart evidence.
 * @layer test
 * @owner order
 * @override Project modules may customize order projection policy or service behavior while preserving cart source references and generated service authority.
 */
const assert = require("assert");

global.ENUMS = {
  ReasonType: {
    ORDERSTATUS: { key: "ORDERSTATUS" },
    PAYMENT: { key: "PAYMENT" },
    SHIPMENT: { key: "SHIPMENT" },
  },
};

const orderProperties = require("../config/properties");
const orderSchemas = require("../src/schemas/schemas").order;
const projectionService = require("../src/service/placement/defaultCheckoutOrderProjectionService");
const workflowService = require("../src/service/placement/defaultCheckoutPlacementWorkflowService");
const entryPolicyService = require("../src/service/entry/defaultOrderEntryPolicyService");

global.CONFIG = {
  get: (key) => (key === "order" ? orderProperties.order : undefined),
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.cause = cause;
      this.code = code;
    }
  },
};

let savedOrders = [];
let savedEntries = [];
global.SERVICE = {
  DefaultOrderEntryPolicyService: entryPolicyService,
  DefaultOrderService: {
    get: async (request) => ({
      result: savedOrders.filter((order) => order.code === request.query.code),
    }),
    save: async (request) => {
      savedOrders.push(JSON.parse(JSON.stringify(request.model)));
      return { result: [request.model] };
    },
  },
  DefaultOrderEntryService: {
    save: async (request) => {
      savedEntries.push(JSON.parse(JSON.stringify(request.model)));
      return { result: [request.model] };
    },
  },
};

const request = {
  tenant: "default",
  authData: { tokenType: "service", principalId: "workflow" },
  workflowCarrier: {
    code: "carrier-1",
    sourceDetail: {
      cartCode: "cart-1",
      entCode: "enterpriseA",
      idempotencyKey: "checkout-1",
    },
  },
  idempotencyKey: "checkout-1",
  cartCode: "cart-1",
  entCode: "enterpriseA",
  cart: {
    code: "cart-1",
    entCode: "enterpriseA",
    active: true,
    status: "READY_FOR_CHECKOUT",
    currencyCode: "USD",
  },
  cartEntries: [
    {
      cartCode: "cart-1",
      entCode: "enterpriseA",
      entryCode: "entry-1",
      lineNumber: 1,
      catalogCode: "catalogA",
      itemType: "SKU",
      itemCode: "phone",
      quantity: "3",
      unitCode: "EA",
      currencyCode: "USD",
      unitPrice: "10.00",
      unitNetAmount: "9.52",
      unitGrossAmount: "10.00",
      totalPrice: "30.00",
      lineNetAmount: "28.56",
      lineGrossAmount: "30.00",
      taxTotal: "1.44",
      taxInclusionMode: "TAX_INCLUSIVE",
      taxIncluded: true,
      taxQuoteCode: "tax-quote-1",
      taxQuoteLineCode: "tax-line-1",
      taxJurisdictionCode: "UAE-DXB",
      taxCategoryCode: "STANDARD",
      taxRateCode: "standard-vat",
      status: "ACTIVE",
    },
    {
      cartCode: "cart-1",
      entCode: "enterpriseA",
      entryCode: "entry-2",
      lineNumber: 2,
      catalogCode: "catalogA",
      itemType: "SKU",
      itemCode: "case",
      quantity: "1",
      unitCode: "EA",
      currencyCode: "USD",
      unitPrice: "5.00",
      totalPrice: "5.00",
      status: "ACTIVE",
    },
  ],
};

(async () => {
  assert.strictEqual(
    orderProperties.order.checkoutPlacement.orderProjection.orderStatus,
    "PLACED",
  );
  assert.strictEqual(
    orderProperties.order.checkoutPlacement.orderProjection.entryStatus,
    "ORDERED",
  );
  assert.strictEqual(orderSchemas.order.definition.cartCode.required, false);
  assert.strictEqual(
    orderSchemas.order.definition.workflowCarrierCode.required,
    false,
  );
  assert.strictEqual(orderSchemas.order.indexes.common.cartCode.enabled, true);

  const projection = await projectionService.create(
    JSON.parse(JSON.stringify(request)),
  );
  assert.strictEqual(projection.idempotent, false);
  assert.strictEqual(projection.order.code, "order::checkout-1");
  assert.strictEqual(projection.order.refCode, "checkout::checkout-1");
  assert.strictEqual(projection.order.entCode, "enterpriseA");
  assert.strictEqual(projection.order.cartCode, "cart-1");
  assert.strictEqual(projection.order.sourceCartCode, "cart-1");
  assert.strictEqual(projection.order.workflowCarrierCode, "carrier-1");
  assert.strictEqual(projection.order.status, "PLACED");
  assert.strictEqual(projection.entries.length, 2);
  assert.strictEqual(projection.entries[0].orderCode, "order::checkout-1");
  assert.strictEqual(projection.entries[0].cartCode, "cart-1");
  assert.strictEqual(projection.entries[0].entryCode, "entry-1");
  assert.strictEqual(projection.entries[0].status, "ORDERED");
  assert.strictEqual(projection.entries[0].lineNetAmount, "28.56");
  assert.strictEqual(projection.entries[0].lineGrossAmount, "30.00");
  assert.strictEqual(projection.entries[0].taxTotal, "1.44");
  assert.strictEqual(projection.entries[0].taxInclusionMode, "TAX_INCLUSIVE");
  assert.strictEqual(projection.entries[0].taxIncluded, true);
  assert.strictEqual(projection.entries[0].taxQuoteLineCode, "tax-line-1");
  assert.strictEqual(savedOrders.length, 1);
  assert.strictEqual(savedEntries.length, 2);

  const replay = await projectionService.create(
    JSON.parse(JSON.stringify(request)),
  );
  assert.strictEqual(replay.idempotent, true);
  assert.strictEqual(replay.order.code, "order::checkout-1");
  assert.strictEqual(savedOrders.length, 1);
  assert.strictEqual(savedEntries.length, 2);

  SERVICE.DefaultCheckoutOrderProjectionService = projectionService;
  const workflowResult = await workflowService.createOrderProjection(
    JSON.parse(JSON.stringify(request)),
  );
  assert.strictEqual(workflowResult.decision, "SUCCESS");
  assert.strictEqual(workflowResult.feedback.action, "createOrderProjection");
  assert.strictEqual(workflowResult.feedback.orderCode, "order::checkout-1");
  assert.strictEqual(workflowResult.feedback.orderProjection.idempotent, true);

  const wrongEnterprise = JSON.parse(JSON.stringify(request));
  wrongEnterprise.idempotencyKey = "checkout-2";
  wrongEnterprise.cart.entCode = "other";
  await assert.rejects(
    () => projectionService.create(wrongEnterprise),
    (error) =>
      error.code === "ERR_ORD_00024" &&
      error.message.includes("cart enterprise does not match request"),
  );

  console.log("Checkout order projection service contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
