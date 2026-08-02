/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderCheckoutAllocationFoundationContract
 * @description Protects order delivery/payment group and quantity-level allocation schemas, immutable exact evidence, and cart-to-order allocation conversion boundaries.
 * @layer test
 * @owner order
 * @override Project modules may extend order checkout allocation schemas and policy while preserving order-owned parent identity and exact allocation evidence.
 */
const assert = require("assert");
const properties = require("../config/properties");
const interceptors = require("../src/interceptors/interceptors");

global.ENUMS = {
  ReasonType: {
    ORDERSTATUS: { key: "ORDERSTATUS" },
    PAYMENT: { key: "PAYMENT" },
    SHIPMENT: { key: "SHIPMENT" },
  },
};

const cartSchemas = require("../../cart/src/schemas/schemas");
const policy = require("../../cart/src/utils/checkoutAllocationPolicy");
const orderSchemas = require("../src/schemas/schemas");
const allocationPolicyService = require("../src/service/allocation/defaultOrderCheckoutAllocationPolicyService");

const order = orderSchemas.order.order;
const orderDeliveryGroupSchema = orderSchemas.order.orderDeliveryGroup;
const orderDeliveryAllocationSchema =
  orderSchemas.order.orderDeliveryAllocation;
const orderPaymentGroupSchema = orderSchemas.order.orderPaymentGroup;
const orderPaymentAllocationSchema = orderSchemas.order.orderPaymentAllocation;
const abstractAllocation = cartSchemas.default.abstractCheckoutAllocation;
const abstractDeliveryGroup = cartSchemas.default.abstractCheckoutDeliveryGroup;

assert.strictEqual(properties.checkoutAllocation, undefined);
assert(
  Array.isArray(
    properties.order.checkoutAllocation.policy.deliveryGroupStatuses,
  ),
);
assert(
  Array.isArray(
    properties.order.checkoutAllocation.policy.paymentGroupStatuses,
  ),
);
assert(
  Array.isArray(properties.order.checkoutAllocation.policy.allocationStatuses),
);
assert.strictEqual(abstractAllocation.definition.quantity.type, "string");
assert.strictEqual(
  abstractDeliveryGroup.definition.deliveryChargeQuoteCode.type,
  "string",
);
assert.strictEqual(
  abstractDeliveryGroup.definition.deliveryChargeAmount.type,
  "string",
);
assert.strictEqual(abstractAllocation.definition.serialNumbers.type, "array");
assert.strictEqual(
  order.definition.deliveryGroups,
  undefined,
  "Order parent must not carry mutable delivery group arrays; groups reference orderCode instead",
);
assert.strictEqual(
  order.definition.paymentGroups,
  undefined,
  "Order parent must not carry mutable payment group arrays; groups reference orderCode instead",
);

[
  orderDeliveryGroupSchema,
  orderDeliveryAllocationSchema,
  orderPaymentGroupSchema,
  orderPaymentAllocationSchema,
].forEach((schema) => {
  assert.strictEqual(schema.model, true);
  assert.strictEqual(schema.service.enabled, true);
  assert.strictEqual(schema.router.enabled, false);
});
assert.strictEqual(
  orderDeliveryGroupSchema.super,
  "abstractCheckoutDeliveryGroup",
);
assert.strictEqual(
  orderPaymentGroupSchema.super,
  "abstractCheckoutPaymentGroup",
);
assert.strictEqual(
  orderDeliveryAllocationSchema.super,
  "abstractCheckoutAllocation",
);
assert.strictEqual(
  orderPaymentAllocationSchema.super,
  "abstractCheckoutAllocation",
);
assert.strictEqual(
  orderDeliveryGroupSchema.definition.orderCode.required,
  true,
);
assert.strictEqual(
  orderDeliveryGroupSchema.definition.cartCode.required,
  false,
);
assert.strictEqual(
  orderDeliveryGroupSchema.definition.sourceDeliveryGroupCode.required,
  false,
);
assert.strictEqual(
  orderDeliveryAllocationSchema.refSchema.entryCode.schemaName,
  "orderEntry",
);
assert.strictEqual(
  orderDeliveryAllocationSchema.refSchema.entryCode.propertyName,
  "entryCode",
);
assert.strictEqual(
  orderDeliveryAllocationSchema.refSchema.deliveryGroupCode.schemaName,
  "orderDeliveryGroup",
);
assert.strictEqual(
  orderDeliveryAllocationSchema.definition.sourceAllocationCode.required,
  false,
);
assert.strictEqual(
  orderDeliveryAllocationSchema.definition.sourceDeliveryGroupCode.required,
  false,
);
assert.strictEqual(
  orderPaymentAllocationSchema.refSchema.paymentGroupCode.schemaName,
  "orderPaymentGroup",
);
assert.strictEqual(
  orderPaymentGroupSchema.definition.sourcePaymentGroupCode.required,
  false,
);
assert.strictEqual(
  orderPaymentAllocationSchema.definition.sourcePaymentGroupCode.required,
  false,
);
assert.strictEqual(
  orderPaymentAllocationSchema.definition.sourceAllocationCode.required,
  false,
);
assert.strictEqual(
  orderPaymentAllocationSchema.definition.amount.type,
  "string",
);
assert.strictEqual(
  orderPaymentAllocationSchema.definition.currencyCode.required,
  true,
);
assert.strictEqual(
  orderDeliveryAllocationSchema.indexes.common.orderCode.enabled,
  true,
);
assert.strictEqual(
  orderPaymentAllocationSchema.indexes.common.paymentGroupCode.enabled,
  true,
);

assert.strictEqual(
  interceptors.orderDeliveryGroupPreSavePolicy.handler,
  "DefaultOrderCheckoutAllocationPolicyService.prepareDeliveryGroup",
);
assert.strictEqual(
  interceptors.orderDeliveryAllocationPreSavePolicy.handler,
  "DefaultOrderCheckoutAllocationPolicyService.prepareDeliveryAllocation",
);
assert.strictEqual(
  interceptors.orderPaymentGroupPreSavePolicy.handler,
  "DefaultOrderCheckoutAllocationPolicyService.preparePaymentGroup",
);
assert.strictEqual(
  interceptors.orderPaymentAllocationPreSavePolicy.handler,
  "DefaultOrderCheckoutAllocationPolicyService.preparePaymentAllocation",
);
assert.strictEqual(
  interceptors.orderPaymentAllocationPreRemovePolicy.handler,
  "DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete",
);

const cartDeliveryAllocation = {
  entCode: "default",
  cartCode: "cart-1",
  allocationCode: "delivery-allocation-1",
  entryCode: "entry-1",
  deliveryGroupCode: "cart-delivery-x",
  quantity: "2",
  unitCode: "piece",
  serialNumbers: ["serial-1", "serial-2"],
};
const cartDeliveryGroup = {
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
const cartPaymentGroup = {
  entCode: "default",
  cartCode: "cart-1",
  paymentGroupCode: "cart-payment-card",
  paymentModeCode: "CARD",
  currencyCode: "USD",
  plannedAmount: "20.00",
};
const cartPaymentAllocation = {
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
const orderDeliveryGroup = {
  entCode: "default",
  orderCode: "order-1",
  deliveryGroupCode: "order-delivery-x",
  groupType: "ADDRESS",
  addressCode: "address-x",
  status: "ORDERED",
};
const orderPaymentAllocation = {
  entCode: "default",
  orderCode: "order-1",
  allocationCode: "payment-allocation-1",
  entryCode: "entry-1",
  paymentGroupCode: "order-payment-card",
  quantity: "2",
  unitCode: "piece",
  amount: "20.00",
  currencyCode: "USD",
  status: "ORDERED",
};

assert.strictEqual(
  policy.validateDeliveryGroup(
    orderDeliveryGroup,
    properties.order.checkoutAllocation.policy,
    { parentField: "orderCode" },
  ).valid,
  true,
);
assert.strictEqual(
  policy.validateAllocation(
    orderPaymentAllocation,
    properties.order.checkoutAllocation.policy,
    {
      parentField: "orderCode",
      groupField: "paymentGroupCode",
      amountRequired: true,
    },
  ).valid,
  true,
);

global.CONFIG = {
  get: (key) => (key === "order" ? properties.order : undefined),
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

const conversionContext = {
  orderCode: "order-1",
  deliveryGroupCodeMap: {
    "cart-delivery-x": "order-delivery-x",
  },
  paymentGroupCodeMap: {
    "cart-payment-card": "order-payment-card",
  },
  allocationCodeMap: {
    "delivery-allocation-1": "order-delivery-allocation-1",
    "payment-allocation-1": "order-payment-allocation-1",
  },
};

const convertedDeliveryGroup =
  allocationPolicyService.buildDeliveryGroupFromCartDeliveryGroup(
    cartDeliveryGroup,
    conversionContext,
  );
assert.strictEqual(convertedDeliveryGroup.orderCode, "order-1");
assert.strictEqual(convertedDeliveryGroup.cartCode, "cart-1");
assert.strictEqual(
  convertedDeliveryGroup.deliveryGroupCode,
  "order-delivery-x",
);
assert.strictEqual(
  convertedDeliveryGroup.sourceDeliveryGroupCode,
  "cart-delivery-x",
);
assert.strictEqual(
  convertedDeliveryGroup.deliveryChargeQuoteCode,
  "delivery-quote-1",
);
assert.strictEqual(convertedDeliveryGroup.deliveryChargeAmount, "5.00");
assert.strictEqual(convertedDeliveryGroup.deliveryChargeCurrencyCode, "USD");
assert.strictEqual(convertedDeliveryGroup.status, "ORDERED");

const convertedPaymentGroup =
  allocationPolicyService.buildPaymentGroupFromCartPaymentGroup(
    cartPaymentGroup,
    conversionContext,
  );
assert.strictEqual(convertedPaymentGroup.orderCode, "order-1");
assert.strictEqual(convertedPaymentGroup.cartCode, "cart-1");
assert.strictEqual(
  convertedPaymentGroup.paymentGroupCode,
  "order-payment-card",
);
assert.strictEqual(
  convertedPaymentGroup.sourcePaymentGroupCode,
  "cart-payment-card",
);
assert.strictEqual(convertedPaymentGroup.plannedAmount, "20.00");

const convertedAllocation =
  allocationPolicyService.buildDeliveryAllocationFromCartDeliveryAllocation(
    cartDeliveryAllocation,
    conversionContext,
  );
assert.strictEqual(convertedAllocation.orderCode, "order-1");
assert.strictEqual(convertedAllocation.cartCode, "cart-1");
assert.strictEqual(
  convertedAllocation.allocationCode,
  "order-delivery-allocation-1",
);
assert.strictEqual(
  convertedAllocation.sourceAllocationCode,
  "delivery-allocation-1",
);
assert.strictEqual(
  convertedAllocation.sourceDeliveryGroupCode,
  "cart-delivery-x",
);
assert.strictEqual(convertedAllocation.deliveryGroupCode, "order-delivery-x");
assert.deepStrictEqual(convertedAllocation.serialNumbers, [
  "serial-1",
  "serial-2",
]);
assert.strictEqual(convertedAllocation.status, "ORDERED");

const convertedPaymentAllocation =
  allocationPolicyService.buildPaymentAllocationFromCartPaymentAllocation(
    cartPaymentAllocation,
    conversionContext,
  );
assert.strictEqual(convertedPaymentAllocation.orderCode, "order-1");
assert.strictEqual(convertedPaymentAllocation.cartCode, "cart-1");
assert.strictEqual(
  convertedPaymentAllocation.allocationCode,
  "order-payment-allocation-1",
);
assert.strictEqual(
  convertedPaymentAllocation.sourceAllocationCode,
  "payment-allocation-1",
);
assert.strictEqual(
  convertedPaymentAllocation.paymentGroupCode,
  "order-payment-card",
);
assert.strictEqual(
  convertedPaymentAllocation.sourcePaymentGroupCode,
  "cart-payment-card",
);
assert.strictEqual(convertedPaymentAllocation.amount, "20.00");

const lowLevelConvertedAllocation =
  allocationPolicyService.buildFromCartAllocation(
    cartDeliveryAllocation,
    { orderCode: "order-2" },
    {
      sourceParentField: "cartCode",
      targetParentField: "orderCode",
      targetStatus: "ORDERED",
      copiedFields: [
        "entCode",
        "allocationCode",
        "entryCode",
        "deliveryGroupCode",
        "quantity",
        "unitCode",
        "serialNumbers",
      ],
    },
  );
assert.strictEqual(lowLevelConvertedAllocation.orderCode, "order-2");
assert.strictEqual(
  allocationPolicyService.prepareDeliveryGroup({ model: orderDeliveryGroup })
    .status,
  "ORDERED",
);
assert.strictEqual(
  allocationPolicyService.preparePaymentAllocation({
    model: orderPaymentAllocation,
  }).status,
  "ORDERED",
);
assert.throws(
  () =>
    allocationPolicyService.preparePaymentAllocation({
      model: Object.assign({}, orderPaymentAllocation, { amount: 0.1 + 0.2 }),
    }),
  /amount must be an exact non-negative decimal string/,
);
(async () => {
  await assert.rejects(
    () => allocationPolicyService.rejectHardDelete(),
    /Order checkout allocation history cannot be hard-deleted/,
  );
  console.log("Order checkout allocation foundation contract validated");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
