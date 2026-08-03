/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/test/cartEntryFoundationContract
 * @description Protects the cart line-entry schema foundation, exact value storage, parent-code relationship, and later-layer extension boundary.
 * @layer test
 * @owner cart
 * @override Project modules may extend cartEntry with customer fields or stricter policies while preserving cart-owned parent identity and exact quantity/money fields.
 */
const assert = require("assert");
const properties = require("../config/properties");
const interceptors = require("../src/interceptors/interceptors");
const schemas = require("../src/schemas/schemas");
const policy = require("../src/utils/checkoutEntryPolicy");
const cartEntryPolicyService = require("../src/service/entry/defaultCartEntryPolicyService");

const abstractEntry = schemas.default.abstractCartEntry;
const cart = schemas.cart.cart;
const cartEntry = schemas.cart.cartEntry;

assert.strictEqual(properties.checkoutEntry, undefined);
assert(Array.isArray(properties.cart.checkoutEntry.policy.requiredFields));
assert(
  properties.cart.checkoutEntry.policy.immutableFields.includes("cartCode"),
);
assert.strictEqual(
  interceptors.cartEntryPreSavePolicy.handler,
  "DefaultCartEntryPolicyService.prepareEntry",
);
assert.strictEqual(
  interceptors.cartEntryPreUpdatePolicy.handler,
  "DefaultCartEntryPolicyService.prepareEntryUpdate",
);
assert.strictEqual(
  interceptors.cartEntryPreRemovePolicy.handler,
  "DefaultCartEntryPolicyService.rejectHardDelete",
);

assert.strictEqual(abstractEntry.model, false);
assert.strictEqual(abstractEntry.service.enabled, false);
assert.strictEqual(abstractEntry.router.enabled, false);
assert.strictEqual(cartEntry.super, "abstractCartEntry");
assert.strictEqual(cartEntry.model, true);
assert.strictEqual(cartEntry.service.enabled, true);
assert.strictEqual(
  cartEntry.router.enabled,
  false,
  "Cart entries must be exposed through Workbench and owner services, not a casual public generated router",
);

[
  "entryCode",
  "lineNumber",
  "catalogCode",
  "itemType",
  "itemCode",
  "quantity",
  "unitCode",
  "currencyCode",
  "unitPrice",
  "unitNetAmount",
  "unitGrossAmount",
  "totalPrice",
  "lineNetAmount",
  "lineGrossAmount",
  "taxTotal",
  "taxInclusionMode",
  "taxIncluded",
  "taxQuoteCode",
  "taxQuoteLineCode",
  "taxJurisdictionCode",
  "taxCategoryCode",
  "taxRateCode",
  "discountTotal",
  "priceEvidenceCode",
  "status",
].forEach((field) => {
  assert(
    abstractEntry.definition[field],
    "abstractCartEntry." + field + " must exist",
  );
});
assert.strictEqual(abstractEntry.definition.quantity.type, "string");
assert.strictEqual(abstractEntry.definition.unitPrice.type, "string");
assert.strictEqual(abstractEntry.definition.unitNetAmount.type, "string");
assert.strictEqual(abstractEntry.definition.unitGrossAmount.type, "string");
assert.strictEqual(abstractEntry.definition.totalPrice.type, "string");
assert.strictEqual(abstractEntry.definition.lineNetAmount.type, "string");
assert.strictEqual(abstractEntry.definition.lineGrossAmount.type, "string");
assert.strictEqual(abstractEntry.definition.taxInclusionMode.type, "string");
assert.strictEqual(abstractEntry.definition.taxIncluded.type, "bool");
assert.strictEqual(
  abstractEntry.definition.quantity.description.includes(
    "never use floating point",
  ),
  true,
);
assert.strictEqual(cartEntry.definition.cartCode.required, true);
assert.strictEqual(cartEntry.refSchema.cartCode.type, "one");
assert.strictEqual(cartEntry.refSchema.cartCode.schemaName, "cart");
assert.strictEqual(cartEntry.refSchema.cartCode.onTargetDelete, "RESTRICT");
assert.strictEqual(
  cart.definition.entries,
  undefined,
  "Cart parent must not carry a mutable entries array; entries reference cartCode instead",
);
assert.strictEqual(cartEntry.indexes.common.cartCode.enabled, true);
assert.strictEqual(cartEntry.indexes.individual.entryCode.options.unique, true);

const projectExtension = Object.assign({}, cartEntry.definition, {
  giftWrapInstruction: {
    type: "string",
    required: false,
    description: "Project-owned cart-entry customization",
  },
});
assert(projectExtension.giftWrapInstruction);
assert.strictEqual(
  cartEntry.definition.giftWrapInstruction,
  undefined,
  "Customer extensions must be layered, not copied into OOTB cartEntry source",
);

const validEntry = {
  entCode: "default",
  cartCode: "cart-1",
  entryCode: "entry-1",
  lineNumber: 1,
  catalogCode: "defaultProductCatalog",
  itemType: "PRODUCT",
  itemCode: "sku-1",
  quantity: "2.500",
  unitCode: "piece",
  currencyCode: "USD",
  unitPrice: "12.99",
  unitNetAmount: "12.37",
  unitGrossAmount: "12.99",
  totalPrice: "25.98",
  lineNetAmount: "24.74",
  lineGrossAmount: "25.98",
  taxTotal: "1.24",
  taxInclusionMode: "TAX_INCLUSIVE",
  taxIncluded: true,
  taxQuoteCode: "tax-quote-1",
  taxQuoteLineCode: "tax-line-1",
  taxJurisdictionCode: "US-CA",
  taxCategoryCode: "STANDARD",
  taxRateCode: "standard-sales-tax",
  discountTotal: "0.00",
  status: "ACTIVE",
};
assert.strictEqual(
  policy.validateEntry(validEntry, {}, { parentField: "cartCode" }).valid,
  true,
);
assert.strictEqual(
  policy.validateEntry(validEntry, {}, { parentField: "cartCode" }).model
    .taxIncluded,
  true,
);
assert.strictEqual(
  policy.validateEntry(
    Object.assign({}, validEntry, { quantity: 0.1 + 0.2 }),
    {},
    { parentField: "cartCode" },
  ).valid,
  false,
  "Cart Entry validation must reject floating-point derived values instead of silently accepting imprecise numbers",
);
assert.strictEqual(
  policy.validateEntry(
    Object.assign({}, validEntry, { quantity: "0" }),
    {},
    { parentField: "cartCode" },
  ).valid,
  false,
  "Cart Entry quantity must be positive",
);
assert.strictEqual(
  policy.validateEntry(
    Object.assign({}, validEntry, { unitNetAmount: 0.1 + 0.2 }),
    {},
    { parentField: "cartCode" },
  ).valid,
  false,
  "Cart Entry validation must reject floating-point derived tax evidence",
);
assert.strictEqual(
  policy.validateEntry(
    Object.assign({}, validEntry, { taxInclusionMode: "BAD" }),
    {},
    { parentField: "cartCode" },
  ).valid,
  false,
  "Cart Entry validation must reject unknown tax inclusion modes",
);
assert.deepStrictEqual(
  policy.validateUpdate(validEntry, { itemCode: "sku-2" }, {}),
  ["itemCode is immutable"],
);

global.CONFIG = {
  get: (key) => (key === "cart" ? properties.cart : undefined),
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.code = code;
      this.cause = cause;
    }
  },
};
global.SERVICE = {
  DefaultCartEntryService: {
    get: async () => ({ result: [validEntry] }),
  },
};
const serviceRequest = { model: Object.assign({}, validEntry) };
assert.strictEqual(
  cartEntryPolicyService.validateEntry(serviceRequest).status,
  "ACTIVE",
);
assert.throws(
  () =>
    cartEntryPolicyService.validateEntry({
      model: Object.assign({}, validEntry, { cartCode: undefined }),
    }),
  /cartCode is required/,
);
(async () => {
  await cartEntryPolicyService.prepareEntryUpdate({
    query: { code: "entry-1" },
    model: { status: "HELD" },
  });
  await assert.rejects(
    () => cartEntryPolicyService.rejectHardDelete(),
    /Cart Entry history cannot be hard-deleted/,
  );
  console.log("Cart entry foundation contract validated");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
