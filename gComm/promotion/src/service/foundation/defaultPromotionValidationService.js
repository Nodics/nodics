/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/service/foundation/DefaultPromotionValidationService
 * @description Validates governed Promotion campaigns, rules, coupon records, evaluation runs, and applied-discount evidence.
 * @layer service
 * @owner promotion
 * @override Project modules may layer stricter promotion validation while preserving exact money, enterprise scope, no executable rule payloads, and immutable applied-discount evidence.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  config: function () {
    return CONFIG.get("promotion") || {};
  },
  error: function (code, message) {
    return SERVICE.DefaultPromotionEnterpriseScopeService.error(code, message);
  },
  assertDateRange: function (model) {
    if (
      model.effectiveFrom &&
      model.effectiveTo &&
      new Date(model.effectiveFrom).getTime() >
        new Date(model.effectiveTo).getTime()
    ) {
      throw this.error(
        "ERR_PROMOTION_00010",
        "Promotion effective date range is invalid",
      );
    }
  },
  assertOneOf: function (value, allowed, label) {
    if (!allowed.includes(value)) {
      throw this.error("ERR_PROMOTION_00011", label + " is invalid");
    }
    return value;
  },
  assertDecimal: function (value, label, allowZero, optional) {
    if (value === undefined || value === null || value === "") {
      if (optional) return undefined;
      throw this.error(
        "ERR_PROMOTION_00012",
        label + " must be an exact decimal string",
      );
    }
    const policy = (this.config() || {}).decimals || {};
    const text = String(value);
    if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(text)) {
      throw this.error(
        "ERR_PROMOTION_00012",
        label + " must be an exact decimal string",
      );
    }
    if (!allowZero && /^0(?:\.0+)?$/.test(text)) {
      throw this.error("ERR_PROMOTION_00012", label + " must be positive");
    }
    const parts = text.split(".");
    const totalDigits = (parts[0] + (parts[1] || "")).length;
    const scale = (parts[1] || "").length;
    if (
      totalDigits > Number(policy.maximumDigits || 38) ||
      scale > Number(policy.maximumScale || 18)
    ) {
      throw this.error(
        "ERR_PROMOTION_00012",
        label + " exceeds exact-decimal bounds",
      );
    }
    return text;
  },
  assertCurrency: function (value, required) {
    if (!value && !required) return true;
    if (!/^[A-Z]{3}$/.test(value || "")) {
      throw this.error(
        "ERR_PROMOTION_00013",
        "Promotion currency code is invalid",
      );
    }
    return true;
  },
  assertSafeObject: function (value, label) {
    if (value === undefined) return true;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw this.error("ERR_PROMOTION_00014", label + " must be an object");
    }
    const text = JSON.stringify(value);
    if (
      !text ||
      text.length > 4096 ||
      /function\s*\(|=>|require\s*\(/.test(text)
    ) {
      throw this.error(
        "ERR_PROMOTION_00014",
        label + " must be bounded non-executable metadata",
      );
    }
    return true;
  },
  prepare: function (request, type, identityProperties) {
    SERVICE.DefaultPromotionEnterpriseScopeService.scopeNewModel(
      request,
      type,
      identityProperties,
    );
    const model = request.model;
    this.assertDateRange(model);
    const lifecycle = (this.config() || {}).lifecycle || {};
    if (
      model.status &&
      (lifecycle.statuses || []).length &&
      !lifecycle.statuses.includes(model.status)
    ) {
      throw this.error("ERR_PROMOTION_00015", "Promotion status is invalid");
    }
    return model;
  },
  prepareCampaign: function (request) {
    const model = this.prepare(request, "promotionCampaign", ["campaignCode"]);
    const policy = (this.config() || {}).rule || {};
    this.assertOneOf(
      model.campaignType || "MERCHANDISING",
      policy.campaignTypes || ["MERCHANDISING"],
      "Promotion campaign type",
    );
    model.budgetLimitAmount = this.assertDecimal(
      model.budgetLimitAmount,
      "Promotion budget limit",
      true,
      true,
    );
    model.budgetConsumedAmount = this.assertDecimal(
      model.budgetConsumedAmount,
      "Promotion consumed budget",
      true,
      true,
    );
    return true;
  },
  prepareRule: function (request) {
    const model = this.prepare(request, "promotionRule", ["ruleCode"]);
    const policy = (this.config() || {}).rule || {};
    this.assertOneOf(
      model.ruleType || "CART",
      policy.ruleTypes || ["CART"],
      "Promotion rule type",
    );
    this.assertOneOf(
      model.evaluationStrategy || "DECLARATIVE_RULE",
      policy.evaluationStrategies || ["DECLARATIVE_RULE"],
      "Promotion evaluation strategy",
    );
    this.assertOneOf(
      model.conditionMode || "ALL",
      policy.conditionModes || ["ALL"],
      "Promotion condition mode",
    );
    return true;
  },
  prepareCondition: function (request) {
    const model = this.prepare(request, "promotionCondition", [
      "conditionCode",
    ]);
    const policy = (this.config() || {}).rule || {};
    this.assertOneOf(
      model.conditionType,
      policy.conditionTypes || [],
      "Promotion condition type",
    );
    this.assertOneOf(
      model.operator || "EQUALS",
      policy.operators || ["EQUALS"],
      "Promotion condition operator",
    );
    this.assertSafeObject(model.value, "Promotion condition value");
    return true;
  },
  prepareAction: function (request) {
    const model = this.prepare(request, "promotionAction", ["actionCode"]);
    const policy = (this.config() || {}).rule || {};
    this.assertOneOf(
      model.actionType,
      policy.actionTypes || [],
      "Promotion action type",
    );
    this.assertOneOf(
      model.targetType || "CART",
      policy.targetTypes || ["CART"],
      "Promotion target type",
    );
    model.discountAmount = this.assertDecimal(
      model.discountAmount,
      "Promotion discount amount",
      true,
      true,
    );
    model.discountRate = this.assertDecimal(
      model.discountRate,
      "Promotion discount rate",
      true,
      true,
    );
    model.maxDiscountAmount = this.assertDecimal(
      model.maxDiscountAmount,
      "Promotion max discount amount",
      true,
      true,
    );
    if (
      model.discountAmount !== undefined ||
      model.maxDiscountAmount !== undefined
    ) {
      this.assertCurrency(model.currencyCode, true);
    }
    return true;
  },
  prepareCouponCampaign: function (request) {
    const model = this.prepare(request, "couponCampaign", [
      "couponCampaignCode",
    ]);
    const policy = (this.config() || {}).coupon || {};
    this.assertOneOf(
      model.couponType || "MULTI_CODE",
      policy.couponTypes || ["MULTI_CODE"],
      "Promotion coupon type",
    );
    return true;
  },
  prepareCouponCode: function (request) {
    const model = this.prepare(request, "couponCode", ["couponCode"]);
    if (Number(model.redemptionCount || 0) < 0) {
      throw this.error(
        "ERR_PROMOTION_00016",
        "Coupon redemption count cannot be negative",
      );
    }
    return true;
  },
  prepareEvaluationRun: function (request) {
    const model = this.prepare(request, "promotionEvaluationRun", [
      "evaluationCode",
    ]);
    this.assertCurrency(model.currencyCode, true);
    model.subtotalAmount = this.assertDecimal(
      model.subtotalAmount,
      "Promotion evaluation subtotal",
      true,
    );
    model.discountTotal = this.assertDecimal(
      model.discountTotal,
      "Promotion evaluation discount total",
      true,
    );
    if (!model.idempotencyKey) {
      throw this.error(
        "ERR_PROMOTION_00017",
        "Promotion evaluation idempotency key is required",
      );
    }
    return true;
  },
  prepareAppliedPromotion: function (request) {
    const model = this.prepare(request, "appliedPromotion", [
      "appliedPromotionCode",
    ]);
    const policy = (this.config() || {}).rule || {};
    this.assertCurrency(model.currencyCode, true);
    this.assertOneOf(
      model.targetType,
      policy.targetTypes || [],
      "Promotion target type",
    );
    this.assertOneOf(
      model.actionType,
      policy.actionTypes || [],
      "Promotion action type",
    );
    this.assertOneOf(
      model.taxTreatment || "BEFORE_TAX",
      policy.taxTreatments || ["BEFORE_TAX"],
      "Promotion tax treatment",
    );
    model.discountAmount = this.assertDecimal(
      model.discountAmount,
      "Applied promotion discount amount",
      true,
    );
    model.discountRate = this.assertDecimal(
      model.discountRate,
      "Applied promotion discount rate",
      true,
      true,
    );
    return true;
  },
  prepareReadonlyEvidenceUpdate: function () {
    throw this.error(
      "ERR_PROMOTION_00018",
      "Promotion evaluation and applied discount evidence is immutable",
    );
  },
  rejectHardDelete: function () {
    return Promise.reject(
      this.error(
        "ERR_PROMOTION_00019",
        "Promotion records cannot be hard deleted",
      ),
    );
  },
};
