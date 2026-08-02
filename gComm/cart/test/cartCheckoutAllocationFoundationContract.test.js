/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/test/cartCheckoutAllocationFoundationContract
 * @description Protects cart delivery/payment group and quantity-level allocation schemas, exact decimal evidence, and serial-ready split fulfillment/payment contracts.
 * @layer test
 * @owner cart
 * @override Project modules may extend checkout allocation schemas and policy while preserving cart-owned parent identity and exact allocation evidence.
 */
const assert = require("assert");
const properties = require("../config/properties");
const interceptors = require("../src/interceptors/interceptors");
const schemas = require("../src/schemas/schemas");
const policy = require("../src/utils/checkoutAllocationPolicy");
const allocationPolicyService = require("../src/service/allocation/defaultCartCheckoutAllocationPolicyService");

const abstractDeliveryGroup = schemas.default.abstractCheckoutDeliveryGroup;
const abstractPaymentGroup = schemas.default.abstractCheckoutPaymentGroup;
const abstractAllocation = schemas.default.abstractCheckoutAllocation;
const cart = schemas.cart.cart;
const cartDeliveryGroup = schemas.cart.cartDeliveryGroup;
const cartDeliveryAllocation = schemas.cart.cartDeliveryAllocation;
const cartPaymentGroup = schemas.cart.cartPaymentGroup;
const cartPaymentAllocation = schemas.cart.cartPaymentAllocation;

assert.strictEqual(properties.checkoutAllocation, undefined);
assert(
  Array.isArray(
    properties.cart.checkoutAllocation.policy.deliveryGroupStatuses,
  ),
);
assert(
  Array.isArray(properties.cart.checkoutAllocation.policy.paymentGroupStatuses),
);
assert(
  Array.isArray(properties.cart.checkoutAllocation.policy.allocationStatuses),
);

assert.strictEqual(abstractDeliveryGroup.model, false);
assert.strictEqual(abstractPaymentGroup.model, false);
assert.strictEqual(abstractAllocation.model, false);
assert.strictEqual(
  abstractDeliveryGroup.definition.deliveryChargeQuoteCode.type,
  "string",
);
assert.strictEqual(
  abstractDeliveryGroup.definition.deliveryChargeAmount.type,
  "string",
);
assert.strictEqual(
  abstractDeliveryGroup.definition.deliveryChargeCurrencyCode.type,
  "string",
);
assert.strictEqual(abstractAllocation.definition.quantity.type, "string");
assert.strictEqual(abstractAllocation.definition.serialNumbers.type, "array");
assert.strictEqual(
  abstractAllocation.definition.serialNumbers.description.includes("serial"),
  true,
);
assert.strictEqual(
  cart.definition.deliveryGroups,
  undefined,
  "Cart parent must not carry mutable delivery group arrays; groups reference cartCode instead",
);
assert.strictEqual(
  cart.definition.paymentGroups,
  undefined,
  "Cart parent must not carry mutable payment group arrays; groups reference cartCode instead",
);

[
  cartDeliveryGroup,
  cartDeliveryAllocation,
  cartPaymentGroup,
  cartPaymentAllocation,
].forEach((schema) => {
  assert.strictEqual(schema.model, true);
  assert.strictEqual(schema.service.enabled, true);
  assert.strictEqual(schema.router.enabled, false);
});
assert.strictEqual(cartDeliveryGroup.super, "abstractCheckoutDeliveryGroup");
assert.strictEqual(cartPaymentGroup.super, "abstractCheckoutPaymentGroup");
assert.strictEqual(cartDeliveryAllocation.super, "abstractCheckoutAllocation");
assert.strictEqual(cartPaymentAllocation.super, "abstractCheckoutAllocation");
assert.strictEqual(
  cartDeliveryAllocation.refSchema.entryCode.schemaName,
  "cartEntry",
);
assert.strictEqual(
  cartDeliveryAllocation.refSchema.entryCode.propertyName,
  "entryCode",
);
assert.strictEqual(
  cartDeliveryAllocation.refSchema.deliveryGroupCode.schemaName,
  "cartDeliveryGroup",
);
assert.strictEqual(
  cartPaymentAllocation.refSchema.paymentGroupCode.schemaName,
  "cartPaymentGroup",
);
assert.strictEqual(cartPaymentAllocation.definition.amount.type, "string");
assert.strictEqual(
  cartPaymentAllocation.definition.currencyCode.required,
  true,
);
assert.strictEqual(
  cartDeliveryAllocation.indexes.common.cartCode.enabled,
  true,
);
assert.strictEqual(
  cartPaymentAllocation.indexes.common.paymentGroupCode.enabled,
  true,
);

assert.strictEqual(
  interceptors.cartDeliveryGroupPreSavePolicy.handler,
  "DefaultCartCheckoutAllocationPolicyService.prepareDeliveryGroup",
);
assert.strictEqual(
  interceptors.cartDeliveryAllocationPreSavePolicy.handler,
  "DefaultCartCheckoutAllocationPolicyService.prepareDeliveryAllocation",
);
assert.strictEqual(
  interceptors.cartPaymentGroupPreSavePolicy.handler,
  "DefaultCartCheckoutAllocationPolicyService.preparePaymentGroup",
);
assert.strictEqual(
  interceptors.cartPaymentAllocationPreSavePolicy.handler,
  "DefaultCartCheckoutAllocationPolicyService.preparePaymentAllocation",
);
assert.strictEqual(
  interceptors.cartPaymentAllocationPreRemovePolicy.handler,
  "DefaultCartCheckoutAllocationPolicyService.rejectHardDelete",
);

const deliveryGroup = {
  entCode: "default",
  cartCode: "cart-1",
  deliveryGroupCode: "cart-delivery-x",
  groupType: "ADDRESS",
  addressCode: "address-x",
  deliveryChargeQuoteCode: "delivery-quote-1",
  deliveryChargeAmount: "5.00",
  deliveryChargeCurrencyCode: "USD",
  deliveryChargeTaxMode: "NET",
};
const deliveryAllocation = {
  entCode: "default",
  cartCode: "cart-1",
  allocationCode: "delivery-allocation-1",
  entryCode: "entry-1",
  deliveryGroupCode: "cart-delivery-x",
  quantity: "2",
  unitCode: "piece",
  serialNumbers: ["serial-1", "serial-2"],
};
const paymentGroup = {
  entCode: "default",
  cartCode: "cart-1",
  paymentGroupCode: "cart-payment-card",
  paymentModeCode: "CARD",
  currencyCode: "USD",
  plannedAmount: "20.00",
};
const paymentAllocation = {
  entCode: "default",
  cartCode: "cart-1",
  allocationCode: "payment-allocation-1",
  entryCode: "entry-1",
  paymentGroupCode: "cart-payment-card",
  quantity: "2",
  unitCode: "piece",
  amount: "20.00",
  currencyCode: "USD",
};

assert.strictEqual(
  policy.validateDeliveryGroup(deliveryGroup, {}, { parentField: "cartCode" })
    .valid,
  true,
);
assert.strictEqual(
  policy.validateDeliveryGroup(
    Object.assign({}, deliveryGroup, { deliveryChargeAmount: 0.1 + 0.2 }),
    {},
    { parentField: "cartCode" },
  ).valid,
  false,
  "Delivery charge evidence must reject floating-point derived values",
);
assert.strictEqual(
  policy.validateDeliveryGroup(
    Object.assign({}, deliveryGroup, { deliveryChargeCurrencyCode: undefined }),
    {},
    { parentField: "cartCode" },
  ).valid,
  false,
  "Delivery charge currency is required when delivery charge amount is present",
);
assert.strictEqual(
  policy.validateAllocation(
    deliveryAllocation,
    {},
    { parentField: "cartCode", groupField: "deliveryGroupCode" },
  ).valid,
  true,
);
assert.strictEqual(
  policy.validatePaymentGroup(paymentGroup, {}, { parentField: "cartCode" })
    .valid,
  true,
);
assert.strictEqual(
  policy.validateAllocation(
    paymentAllocation,
    {},
    {
      parentField: "cartCode",
      groupField: "paymentGroupCode",
      amountRequired: true,
    },
  ).valid,
  true,
);
assert.strictEqual(
  policy.validateAllocation(
    Object.assign({}, deliveryAllocation, { quantity: 0.1 + 0.2 }),
    {},
    { parentField: "cartCode", groupField: "deliveryGroupCode" },
  ).valid,
  false,
  "Checkout allocation validation must reject floating-point derived values",
);
assert.strictEqual(
  policy.validateAllocation(
    Object.assign({}, deliveryAllocation, { quantity: "0" }),
    {},
    { parentField: "cartCode", groupField: "deliveryGroupCode" },
  ).valid,
  false,
  "Checkout allocation quantity must be positive",
);
assert.strictEqual(
  policy.validateAllocation(
    Object.assign({}, deliveryAllocation, { serialNumbers: "serial-1" }),
    {},
    { parentField: "cartCode", groupField: "deliveryGroupCode" },
  ).valid,
  false,
  "Serial evidence must be an array when present",
);
assert.strictEqual(
  policy.validateAllocationTotals(
    [{ entryCode: "entry-1", quantity: "3" }],
    [
      Object.assign({}, deliveryAllocation, {
        allocationCode: "delivery-allocation-1",
        quantity: "2",
      }),
      Object.assign({}, deliveryAllocation, {
        allocationCode: "delivery-allocation-2",
        quantity: "1",
        deliveryGroupCode: "cart-delivery-y",
      }),
    ],
    {},
  ).valid,
  true,
  "One entry quantity must support split delivery allocations such as 2 units to X and 1 unit to Y",
);
assert.deepStrictEqual(
  policy.validateAllocationTotals(
    [{ entryCode: "entry-1", quantity: "3" }],
    [
      Object.assign({}, deliveryAllocation, {
        allocationCode: "delivery-allocation-1",
        quantity: "2",
      }),
      Object.assign({}, deliveryAllocation, {
        allocationCode: "delivery-allocation-2",
        quantity: "2",
        deliveryGroupCode: "cart-delivery-y",
      }),
    ],
    {},
  ).errors,
  ["entry entry-1 allocation quantity exceeds entry quantity"],
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

assert.strictEqual(
  allocationPolicyService.prepareDeliveryGroup({ model: deliveryGroup }).status,
  "DRAFT",
);
assert.strictEqual(
  allocationPolicyService.prepareDeliveryAllocation({
    model: deliveryAllocation,
  }).status,
  "ACTIVE",
);
assert.strictEqual(
  allocationPolicyService.preparePaymentGroup({ model: paymentGroup }).status,
  "DRAFT",
);
assert.strictEqual(
  allocationPolicyService.preparePaymentAllocation({ model: paymentAllocation })
    .status,
  "ACTIVE",
);
assert.throws(
  () =>
    allocationPolicyService.preparePaymentAllocation({
      model: Object.assign({}, paymentAllocation, { amount: undefined }),
    }),
  /amount is required/,
);
(async () => {
  await assert.rejects(
    () => allocationPolicyService.rejectHardDelete(),
    /Cart checkout allocation history cannot be hard-deleted/,
  );
  console.log("Cart checkout allocation foundation contract validated");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
