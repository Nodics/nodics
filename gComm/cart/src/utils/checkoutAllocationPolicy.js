/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/utils/checkoutAllocationPolicy
 * @description Shared checkout group and quantity-allocation policy helpers owned by Cart because Cart contributes the abstract checkout allocation schemas reused by Order.
 * @layer utility
 * @owner cart
 * @override Project modules may override cart/order checkoutAllocation policy or replace consuming services without duplicating exact allocation validation logic.
 */
const DEFAULT_POLICY = {
  quantityPattern: "^(0|[1-9][0-9]*)(\\.[0-9]+)?$",
  moneyPattern: "^(0|[1-9][0-9]*)(\\.[0-9]+)?$",
  maximumDigits: 38,
  maximumScale: 18,
  deliveryGroupStatuses: [
    "DRAFT",
    "ACTIVE",
    "ALLOCATED",
    "RELEASED",
    "CANCELLED",
  ],
  paymentGroupStatuses: [
    "DRAFT",
    "ACTIVE",
    "AUTHORIZED",
    "CAPTURED",
    "PARTIALLY_REFUNDED",
    "REFUNDED",
    "CANCELLED",
  ],
  allocationStatuses: [
    "ACTIVE",
    "RESERVED",
    "ALLOCATED",
    "RELEASED",
    "CANCELLED",
  ],
  deliveryGroupRequiredFields: ["entCode", "deliveryGroupCode"],
  paymentGroupRequiredFields: [
    "entCode",
    "paymentGroupCode",
    "paymentModeCode",
    "currencyCode",
  ],
  allocationRequiredFields: [
    "entCode",
    "allocationCode",
    "entryCode",
    "quantity",
    "unitCode",
  ],
  deliveryGroupTypes: ["ADDRESS", "PICKUP", "DIGITAL", "SERVICE"],
  amountFields: [
    "amount",
    "plannedAmount",
    "authorizedAmount",
    "capturedAmount",
    "refundedAmount",
  ],
  conversion: {
    sourceParentField: "cartCode",
    targetParentField: "orderCode",
    targetStatus: "ORDERED",
    deliveryGroupCopiedFields: [
      "entCode",
      "deliveryGroupCode",
      "groupType",
      "addressCode",
      "deliveryModeCode",
      "carrierCode",
      "deliveryChargeQuoteCode",
      "deliveryChargeAmount",
      "deliveryChargeCurrencyCode",
      "deliveryChargeTaxMode",
    ],
    paymentGroupCopiedFields: [
      "entCode",
      "paymentGroupCode",
      "paymentModeCode",
      "currencyCode",
      "plannedAmount",
      "authorizedAmount",
      "capturedAmount",
      "refundedAmount",
      "paymentEvidenceCode",
    ],
    deliveryAllocationCopiedFields: [
      "entCode",
      "allocationCode",
      "entryCode",
      "deliveryGroupCode",
      "quantity",
      "unitCode",
      "serialNumbers",
      "inventoryReservationCode",
      "inventoryAllocationCode",
    ],
    paymentAllocationCopiedFields: [
      "entCode",
      "allocationCode",
      "entryCode",
      "paymentGroupCode",
      "quantity",
      "unitCode",
      "serialNumbers",
      "inventoryReservationCode",
      "inventoryAllocationCode",
      "amount",
      "currencyCode",
    ],
  },
};

const clone = function (value) {
  return JSON.parse(JSON.stringify(value || {}));
};

const mergeObject = function (base, override) {
  const result = clone(base);
  Object.entries(override || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeObject(result[key], value);
    } else {
      result[key] = clone(value);
    }
  });
  return result;
};

const mergePolicy = function (policy) {
  return mergeObject(DEFAULT_POLICY, policy);
};

const digits = function (value) {
  const parts = String(value).split(".");
  return {
    total: (parts[0] + (parts[1] || "")).length,
    scale: (parts[1] || "").length,
  };
};

const isZero = function (value) {
  return /^0(?:\.0+)?$/.test(String(value));
};

const validateDecimal = function (value, pattern, policy, options) {
  if (typeof value !== "string") return false;
  const text = String(value === undefined ? "" : value);
  const expression = new RegExp(pattern);
  const precision = digits(text);
  if (!expression.test(text)) return false;
  if (options.positive && isZero(text)) return false;
  return (
    precision.total <=
      Number(policy.maximumDigits || DEFAULT_POLICY.maximumDigits) &&
    precision.scale <=
      Number(policy.maximumScale || DEFAULT_POLICY.maximumScale)
  );
};

const requireFields = function (model, fields, errors) {
  (fields || []).forEach((field) => {
    if (
      model[field] === undefined ||
      model[field] === null ||
      model[field] === ""
    ) {
      errors.push(field + " is required");
    }
  });
};

const validateDeliveryGroup = function (group, policy, options) {
  const activePolicy = mergePolicy(policy);
  const activeOptions = Object.assign(
    { parentField: undefined },
    options || {},
  );
  const model = Object.assign({}, group || {});
  const errors = [];

  requireFields(model, activePolicy.deliveryGroupRequiredFields, errors);
  if (activeOptions.parentField && !model[activeOptions.parentField])
    errors.push(activeOptions.parentField + " is required");
  if (
    !(activePolicy.deliveryGroupTypes || []).includes(
      model.groupType || "ADDRESS",
    )
  )
    errors.push("groupType is not allowed");
  if (
    !(activePolicy.deliveryGroupStatuses || []).includes(
      model.status || "DRAFT",
    )
  )
    errors.push("status is not allowed");
  if (
    model.deliveryChargeAmount !== undefined &&
    !validateDecimal(
      model.deliveryChargeAmount,
      activePolicy.moneyPattern,
      activePolicy,
      { positive: false },
    )
  ) {
    errors.push(
      "deliveryChargeAmount must be an exact non-negative decimal string",
    );
  }
  if (
    model.deliveryChargeAmount !== undefined &&
    !/^[A-Z]{3}$/.test(model.deliveryChargeCurrencyCode || "")
  ) {
    errors.push(
      "deliveryChargeCurrencyCode is required when deliveryChargeAmount is provided",
    );
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    model: Object.assign({}, model, {
      groupType: model.groupType || "ADDRESS",
      status: model.status || "DRAFT",
    }),
  };
};

const validatePaymentGroup = function (group, policy, options) {
  const activePolicy = mergePolicy(policy);
  const activeOptions = Object.assign(
    { parentField: undefined },
    options || {},
  );
  const model = Object.assign({}, group || {});
  const errors = [];

  requireFields(model, activePolicy.paymentGroupRequiredFields, errors);
  if (activeOptions.parentField && !model[activeOptions.parentField])
    errors.push(activeOptions.parentField + " is required");
  if (
    !(activePolicy.paymentGroupStatuses || []).includes(model.status || "DRAFT")
  )
    errors.push("status is not allowed");

  [
    "plannedAmount",
    "authorizedAmount",
    "capturedAmount",
    "refundedAmount",
  ].forEach((field) => {
    if (
      model[field] !== undefined &&
      !validateDecimal(model[field], activePolicy.moneyPattern, activePolicy, {
        positive: false,
      })
    ) {
      errors.push(field + " must be an exact non-negative decimal string");
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors,
    model: Object.assign({}, model, { status: model.status || "DRAFT" }),
  };
};

const validateAllocation = function (allocation, policy, options) {
  const activePolicy = mergePolicy(policy);
  const activeOptions = Object.assign(
    { parentField: undefined, groupField: undefined, amountRequired: false },
    options || {},
  );
  const model = Object.assign({}, allocation || {});
  const errors = [];

  requireFields(model, activePolicy.allocationRequiredFields, errors);
  if (activeOptions.parentField && !model[activeOptions.parentField])
    errors.push(activeOptions.parentField + " is required");
  if (activeOptions.groupField && !model[activeOptions.groupField])
    errors.push(activeOptions.groupField + " is required");
  if (
    !validateDecimal(
      model.quantity,
      activePolicy.quantityPattern,
      activePolicy,
      { positive: true },
    )
  ) {
    errors.push("quantity must be an exact positive decimal string");
  }
  if (activeOptions.amountRequired && !model.amount)
    errors.push("amount is required");
  if (
    model.amount !== undefined &&
    !validateDecimal(model.amount, activePolicy.moneyPattern, activePolicy, {
      positive: false,
    })
  ) {
    errors.push("amount must be an exact non-negative decimal string");
  }
  if (
    model.serialNumbers !== undefined &&
    !Array.isArray(model.serialNumbers)
  ) {
    errors.push("serialNumbers must be an array");
  }
  if (
    !(activePolicy.allocationStatuses || []).includes(model.status || "ACTIVE")
  )
    errors.push("status is not allowed");

  return {
    valid: errors.length === 0,
    errors: errors,
    model: Object.assign({}, model, {
      serialNumbers: Array.isArray(model.serialNumbers)
        ? model.serialNumbers
        : [],
      status: model.status || "ACTIVE",
    }),
  };
};

const toScaledInteger = function (value, scale) {
  const parts = String(value).split(".");
  const integer = parts[0] || "0";
  const fraction = (parts[1] || "").padEnd(scale, "0");
  return BigInt(integer + fraction);
};

const addScaledDecimal = function (left, right, scale) {
  return (
    toScaledInteger(left || "0", scale) + toScaledInteger(right || "0", scale)
  );
};

const validateAllocationTotals = function (entries, allocations, policy) {
  const activePolicy = mergePolicy(policy);
  const scale = Number(
    activePolicy.maximumScale || DEFAULT_POLICY.maximumScale,
  );
  const entryByCode = new Map();
  const totalsByEntry = new Map();
  const errors = [];

  (entries || []).forEach((entry) => {
    if (entry && entry.entryCode) entryByCode.set(entry.entryCode, entry);
  });

  (allocations || []).forEach((allocation) => {
    if (!allocation || !allocation.entryCode) return;
    const entry = entryByCode.get(allocation.entryCode);
    if (!entry) {
      errors.push(
        "allocation " +
          allocation.allocationCode +
          " references a missing entry",
      );
      return;
    }
    if (
      !validateDecimal(
        allocation.quantity,
        activePolicy.quantityPattern,
        activePolicy,
        { positive: true },
      )
    ) {
      errors.push(
        "allocation " + allocation.allocationCode + " quantity is invalid",
      );
      return;
    }
    const current = totalsByEntry.get(allocation.entryCode) || BigInt(0);
    totalsByEntry.set(
      allocation.entryCode,
      current + toScaledInteger(allocation.quantity, scale),
    );
  });

  totalsByEntry.forEach((allocated, entryCode) => {
    const entry = entryByCode.get(entryCode);
    if (
      !validateDecimal(
        entry.quantity,
        activePolicy.quantityPattern,
        activePolicy,
        { positive: true },
      )
    ) {
      errors.push("entry " + entryCode + " quantity is invalid");
      return;
    }
    if (allocated > toScaledInteger(entry.quantity, scale)) {
      errors.push(
        "entry " + entryCode + " allocation quantity exceeds entry quantity",
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors,
  };
};

const buildOrderModelFromCartModel = function (cartModel, context, options) {
  const source = cartModel || {};
  const activeContext = context || {};
  const activeOptions = Object.assign(
    {
      sourceParentField: "cartCode",
      targetParentField: "orderCode",
      copiedFields: [],
      targetStatus: undefined,
    },
    options || {},
  );
  const target = {};

  (activeOptions.copiedFields || []).forEach((field) => {
    if (source[field] !== undefined) target[field] = clone(source[field]);
  });

  target[activeOptions.targetParentField] =
    activeContext[activeOptions.targetParentField];
  target[activeOptions.sourceParentField] =
    source[activeOptions.sourceParentField];
  if (activeOptions.targetStatus)
    target.status = activeContext.status || activeOptions.targetStatus;
  return target;
};

const resolveMappedCode = function (value, codeMap) {
  if (!value || !codeMap) return value;
  return codeMap[value] || value;
};

const buildOrderDeliveryGroupFromCartDeliveryGroup = function (
  cartDeliveryGroup,
  orderContext,
  policy,
) {
  const activePolicy = mergePolicy(policy);
  const conversion = activePolicy.conversion || DEFAULT_POLICY.conversion;
  const target = buildOrderModelFromCartModel(cartDeliveryGroup, orderContext, {
    sourceParentField: conversion.sourceParentField,
    targetParentField: conversion.targetParentField,
    targetStatus: conversion.targetStatus,
    copiedFields: conversion.deliveryGroupCopiedFields,
  });

  target.sourceDeliveryGroupCode =
    cartDeliveryGroup && cartDeliveryGroup.deliveryGroupCode;
  target.deliveryGroupCode = resolveMappedCode(
    target.deliveryGroupCode,
    (orderContext || {}).deliveryGroupCodeMap,
  );
  return target;
};

const buildOrderPaymentGroupFromCartPaymentGroup = function (
  cartPaymentGroup,
  orderContext,
  policy,
) {
  const activePolicy = mergePolicy(policy);
  const conversion = activePolicy.conversion || DEFAULT_POLICY.conversion;
  const target = buildOrderModelFromCartModel(cartPaymentGroup, orderContext, {
    sourceParentField: conversion.sourceParentField,
    targetParentField: conversion.targetParentField,
    targetStatus: conversion.targetStatus,
    copiedFields: conversion.paymentGroupCopiedFields,
  });

  target.sourcePaymentGroupCode =
    cartPaymentGroup && cartPaymentGroup.paymentGroupCode;
  target.paymentGroupCode = resolveMappedCode(
    target.paymentGroupCode,
    (orderContext || {}).paymentGroupCodeMap,
  );
  return target;
};

const buildOrderDeliveryAllocationFromCartDeliveryAllocation = function (
  cartDeliveryAllocation,
  orderContext,
  policy,
) {
  const activePolicy = mergePolicy(policy);
  const conversion = activePolicy.conversion || DEFAULT_POLICY.conversion;
  const target = buildOrderModelFromCartModel(
    cartDeliveryAllocation,
    orderContext,
    {
      sourceParentField: conversion.sourceParentField,
      targetParentField: conversion.targetParentField,
      targetStatus: conversion.targetStatus,
      copiedFields: conversion.deliveryAllocationCopiedFields,
    },
  );

  target.sourceAllocationCode =
    cartDeliveryAllocation && cartDeliveryAllocation.allocationCode;
  target.sourceDeliveryGroupCode =
    cartDeliveryAllocation && cartDeliveryAllocation.deliveryGroupCode;
  target.allocationCode = resolveMappedCode(
    target.allocationCode,
    (orderContext || {}).allocationCodeMap,
  );
  target.deliveryGroupCode = resolveMappedCode(
    target.deliveryGroupCode,
    (orderContext || {}).deliveryGroupCodeMap,
  );
  return target;
};

const buildOrderPaymentAllocationFromCartPaymentAllocation = function (
  cartPaymentAllocation,
  orderContext,
  policy,
) {
  const activePolicy = mergePolicy(policy);
  const conversion = activePolicy.conversion || DEFAULT_POLICY.conversion;
  const target = buildOrderModelFromCartModel(
    cartPaymentAllocation,
    orderContext,
    {
      sourceParentField: conversion.sourceParentField,
      targetParentField: conversion.targetParentField,
      targetStatus: conversion.targetStatus,
      copiedFields: conversion.paymentAllocationCopiedFields,
    },
  );

  target.sourceAllocationCode =
    cartPaymentAllocation && cartPaymentAllocation.allocationCode;
  target.sourcePaymentGroupCode =
    cartPaymentAllocation && cartPaymentAllocation.paymentGroupCode;
  target.allocationCode = resolveMappedCode(
    target.allocationCode,
    (orderContext || {}).allocationCodeMap,
  );
  target.paymentGroupCode = resolveMappedCode(
    target.paymentGroupCode,
    (orderContext || {}).paymentGroupCodeMap,
  );
  return target;
};

module.exports = {
  DEFAULT_POLICY,
  mergePolicy,
  validateDeliveryGroup,
  validatePaymentGroup,
  validateAllocation,
  validateAllocationTotals,
  addScaledDecimal,
  buildOrderModelFromCartModel,
  buildOrderDeliveryGroupFromCartDeliveryGroup,
  buildOrderPaymentGroupFromCartPaymentGroup,
  buildOrderDeliveryAllocationFromCartDeliveryAllocation,
  buildOrderPaymentAllocationFromCartPaymentAllocation,
};
