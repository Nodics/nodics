/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/test/promotionFoundationContract
 * @description Protects Promotion-owned campaign, rule, condition, action, coupon, evaluation, and applied-discount foundation contracts.
 * @layer test
 * @owner promotion
 * @override Project modules may extend promotion behavior while preserving enterprise scope, exact values, safe rule metadata, and immutable applied-discount evidence.
 */
const assert = require("assert");

const properties = require("../config/properties").promotion;
const backoffice = require("../config/properties").backofficeCapabilities
  .promotion;
const schemas = require("../src/schemas/schemas").promotion;
const interceptors = require("../src/interceptors/interceptors");
const scopeService = require("../src/service/foundation/defaultPromotionEnterpriseScopeService");
const validation = require("../src/service/foundation/defaultPromotionValidationService");

global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(message, cause, code) {
      super(String(message));
      this.cause = cause;
      this.code = code;
    }
  },
};
global.CONFIG = {
  get: (key) => (key === "promotion" ? properties : undefined),
};
global.SERVICE = {
  DefaultPromotionEnterpriseScopeService: scopeService,
  DefaultPromotionValidationService: validation,
};

[
  "promotionCampaign",
  "promotionRule",
  "promotionCondition",
  "promotionAction",
  "couponCampaign",
  "couponCode",
  "promotionEvaluationRun",
  "appliedPromotion",
].forEach((name) => {
  assert.strictEqual(schemas[name].model, true);
  assert.strictEqual(schemas[name].service.enabled, true);
  assert.strictEqual(schemas[name].router.enabled, false);
  assert.strictEqual(schemas[name].definition.enterpriseCode.required, true);
  assert(interceptors[name + "PreSave"]);
  assert(interceptors[name + "PreGet"]);
  assert(interceptors[name + "PreUpdate"]);
  assert(interceptors[name + "PreRemove"]);
});

assert.strictEqual(
  schemas.promotionRule.refSchema.campaignCode.schema,
  "promotionCampaign",
);
assert.strictEqual(
  schemas.promotionCondition.refSchema.ruleCode.schema,
  "promotionRule",
);
assert.strictEqual(
  schemas.promotionAction.refSchema.ruleCode.schema,
  "promotionRule",
);
assert.strictEqual(
  schemas.couponCode.refSchema.couponCampaignCode.schema,
  "couponCampaign",
);
assert.strictEqual(
  schemas.appliedPromotion.refSchema.evaluationCode.schema,
  "promotionEvaluationRun",
);
assert.strictEqual(
  schemas.appliedPromotion.definition.discountAmount.type,
  "string",
);
assert.strictEqual(
  schemas.promotionEvaluationRun.definition.discountTotal.description.includes(
    "Exact decimal-string",
  ),
  true,
);

const authData = { enterprise: { code: "enterpriseA" } };
const campaignRequest = {
  authData,
  model: {
    campaignCode: "summer-sale",
    name: "Summer Sale",
    campaignType: "MERCHANDISING",
    priority: 100,
    status: "ACTIVE",
  },
};
validation.prepareCampaign(campaignRequest);
assert.strictEqual(campaignRequest.model.enterpriseCode, "enterpriseA");
assert.strictEqual(
  campaignRequest.model.code,
  "enterpriseA::promotionCampaign::summer-sale",
);

const ruleRequest = {
  authData,
  model: {
    ruleCode: "summer-cart-10",
    campaignCode: "summer-sale",
    name: "10 percent off cart",
    ruleType: "CART",
    evaluationStrategy: "DECLARATIVE_RULE",
    conditionMode: "ALL",
    priority: 50,
    couponRequired: true,
    exclusive: false,
    status: "ACTIVE",
  },
};
validation.prepareRule(ruleRequest);
assert.strictEqual(
  ruleRequest.model.code,
  "enterpriseA::promotionRule::summer-cart-10",
);

const conditionRequest = {
  authData,
  model: {
    conditionCode: "summer-cart-total",
    ruleCode: "summer-cart-10",
    conditionType: "CART_TOTAL",
    operator: "GREATER_THAN_OR_EQUALS",
    value: { currencyCode: "USD", amount: "100.00" },
    sequence: 10,
    status: "ACTIVE",
  },
};
validation.prepareCondition(conditionRequest);
assert.strictEqual(
  conditionRequest.model.code,
  "enterpriseA::promotionCondition::summer-cart-total",
);
assert.throws(
  () =>
    validation.prepareCondition({
      authData,
      model: Object.assign({}, conditionRequest.model, {
        conditionCode: "unsafe",
        value: { script: "function () { return true; }" },
      }),
    }),
  (error) => error.code === "ERR_PROMOTION_00014",
);

const actionRequest = {
  authData,
  model: {
    actionCode: "summer-cart-10-action",
    ruleCode: "summer-cart-10",
    actionType: "ORDER_PERCENTAGE_DISCOUNT",
    targetType: "CART",
    currencyCode: "USD",
    discountRate: "10.00",
    maxDiscountAmount: "25.00",
    sequence: 10,
    status: "ACTIVE",
  },
};
validation.prepareAction(actionRequest);
assert.strictEqual(actionRequest.model.discountRate, "10.00");
assert.throws(
  () =>
    validation.prepareAction({
      authData,
      model: Object.assign({}, actionRequest.model, {
        actionCode: "bad-money",
        discountRate: "10.1234567890123456789",
      }),
    }),
  (error) => error.code === "ERR_PROMOTION_00012",
);

const couponCampaignRequest = {
  authData,
  model: {
    couponCampaignCode: "summer-coupons",
    campaignCode: "summer-sale",
    ruleCode: "summer-cart-10",
    name: "Summer coupon codes",
    couponType: "MULTI_CODE",
    maxRedemptions: 1000,
    maxRedemptionsPerCustomer: 1,
    status: "ACTIVE",
  },
};
validation.prepareCouponCampaign(couponCampaignRequest);
assert.strictEqual(
  couponCampaignRequest.model.code,
  "enterpriseA::couponCampaign::summer-coupons",
);

const couponCodeRequest = {
  authData,
  model: {
    couponCode: "SUMMER10",
    couponCampaignCode: "summer-coupons",
    redemptionCount: 0,
    maxRedemptions: 1,
    status: "ACTIVE",
  },
};
validation.prepareCouponCode(couponCodeRequest);
assert.strictEqual(
  couponCodeRequest.model.code,
  "enterpriseA::couponCode::SUMMER10",
);

const evaluationRequest = {
  authData,
  model: {
    evaluationCode: "cart-100-promo-eval",
    idempotencyKey: "cart-100::promo::1",
    sourceType: "CART",
    sourceCode: "cart-100",
    currencyCode: "USD",
    subtotalAmount: "120.00",
    discountTotal: "12.00",
    taxInclusionMode: "TAX_EXCLUSIVE",
    evaluatedRuleCodes: ["summer-cart-10"],
    appliedRuleCodes: ["summer-cart-10"],
    status: "EVALUATED",
  },
};
validation.prepareEvaluationRun(evaluationRequest);
assert.strictEqual(
  evaluationRequest.model.code,
  "enterpriseA::promotionEvaluationRun::cart-100-promo-eval",
);

const appliedRequest = {
  authData,
  model: {
    appliedPromotionCode: "cart-100-line-1-summer-cart-10",
    evaluationCode: "cart-100-promo-eval",
    campaignCode: "summer-sale",
    ruleCode: "summer-cart-10",
    actionCode: "summer-cart-10-action",
    couponCode: "SUMMER10",
    sourceType: "CART",
    sourceCode: "cart-100",
    targetType: "ENTRY",
    targetCode: "line-1",
    actionType: "ORDER_PERCENTAGE_DISCOUNT",
    currencyCode: "USD",
    discountAmount: "12.00",
    discountRate: "10.00",
    taxTreatment: "BEFORE_TAX",
    status: "APPLIED",
  },
};
validation.prepareAppliedPromotion(appliedRequest);
assert.strictEqual(
  appliedRequest.model.code,
  "enterpriseA::appliedPromotion::cart-100-line-1-summer-cart-10",
);
assert.throws(
  () => validation.prepareReadonlyEvidenceUpdate(),
  (error) => error.code === "ERR_PROMOTION_00018",
);

assert.strictEqual(backoffice.enabled, true);
assert.strictEqual(backoffice.displayName, "Promotion");
assert.strictEqual(backoffice.navigation[0].id, "promotions");
assert.strictEqual(
  backoffice.navigation[0].workbenchTarget.schemaName,
  "promotionCampaign",
);
assert.strictEqual(
  backoffice.navigation.find((item) => item.id === "coupons").workbenchTarget
    .schemaName,
  "couponCampaign",
);
assert.strictEqual(
  backoffice.navigation.find((item) => item.id === "applied-promotions")
    .workbenchTarget.schemaName,
  "appliedPromotion",
);

console.log("Promotion foundation contract validated");
