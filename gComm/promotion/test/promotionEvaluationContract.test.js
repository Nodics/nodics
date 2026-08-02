/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/test/promotionEvaluationContract
 * @description Protects deterministic Promotion evaluation, stacking, coupon reservation, budget reservation, and rollback evidence contracts.
 * @layer test
 * @owner promotion
 * @override Customer modules may replace evaluator strategy while preserving exact decimals, safe metadata, immutable evidence, and owned coupon/budget plans.
 */
const assert = require("assert");

const evaluator = require("../src/service/foundation/defaultPromotionEvaluationService");
const validation = require("../src/service/foundation/defaultPromotionValidationService");
const scopeService = require("../src/service/foundation/defaultPromotionEnterpriseScopeService");
const properties = require("../config/properties").promotion;

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

const context = {
  enterpriseCode: "enterpriseA",
  sourceType: "CART",
  sourceCode: "cart-900",
  idempotencyKey: "cart-900::promo::1",
  currencyCode: "USD",
  subtotalAmount: "120.00",
  couponCode: "SAVE10",
  customerCode: "customerA",
  source: {
    subtotalAmount: "120.00",
    channelCode: "web",
  },
  at: new Date("2026-08-03T00:00:00.000Z"),
};

const campaigns = [
  {
    campaignCode: "summer",
    status: "ACTIVE",
    budgetLimitAmount: "100.00",
    budgetConsumedAmount: "20.00",
  },
  {
    campaignCode: "vip",
    status: "ACTIVE",
  },
];
const rules = [
  {
    ruleCode: "cart-ten-percent",
    campaignCode: "summer",
    status: "ACTIVE",
    priority: 10,
    conditionMode: "ALL",
    stackabilityGroup: "cart",
    couponRequired: true,
  },
  {
    ruleCode: "cart-five-percent",
    campaignCode: "vip",
    status: "ACTIVE",
    priority: 20,
    conditionMode: "ALL",
    stackabilityGroup: "cart",
  },
];
const conditions = [
  {
    conditionCode: "cart-over-100",
    ruleCode: "cart-ten-percent",
    status: "ACTIVE",
    fieldPath: "source.subtotalAmount",
    operator: "GREATER_THAN_OR_EQUALS",
    value: { amount: "100.00" },
  },
  {
    conditionCode: "cart-five-over-50",
    ruleCode: "cart-five-percent",
    status: "ACTIVE",
    fieldPath: "source.subtotalAmount",
    operator: "GREATER_THAN_OR_EQUALS",
    value: { amount: "50.00" },
  },
];
const actions = [
  {
    actionCode: "ten-percent",
    ruleCode: "cart-ten-percent",
    status: "ACTIVE",
    actionType: "ORDER_PERCENTAGE_DISCOUNT",
    targetType: "CART",
    discountRate: "10.00",
    sequence: 10,
  },
  {
    actionCode: "five-percent",
    ruleCode: "cart-five-percent",
    status: "ACTIVE",
    actionType: "ORDER_PERCENTAGE_DISCOUNT",
    targetType: "CART",
    discountRate: "5.00",
    sequence: 10,
  },
];
const couponCampaigns = [
  {
    couponCampaignCode: "summer-coupons",
    ruleCode: "cart-ten-percent",
    status: "ACTIVE",
  },
];
const couponCodes = [
  {
    couponCode: "SAVE10",
    couponCampaignCode: "summer-coupons",
    customerCode: "customerA",
    redemptionCount: 0,
    maxRedemptions: 1,
    status: "ACTIVE",
  },
];

const result = evaluator.evaluate({
  evaluationCode: "cart-900-promotion-evaluation",
  context,
  campaigns,
  rules,
  conditions,
  actions,
  couponCampaigns,
  couponCodes,
});

assert.strictEqual(result.evaluationRun.status, "EVALUATED");
assert.strictEqual(result.evaluationRun.discountTotal, "12.00");
assert.deepStrictEqual(result.evaluationRun.evaluatedRuleCodes, [
  "cart-ten-percent",
  "cart-five-percent",
]);
assert.deepStrictEqual(result.evaluationRun.appliedRuleCodes, [
  "cart-ten-percent",
]);
assert.strictEqual(result.appliedPromotions.length, 1);
assert.strictEqual(result.appliedPromotions[0].discountAmount, "12.00");
assert.strictEqual(result.appliedPromotions[0].couponPlan.action, "HOLD");
assert.strictEqual(
  result.appliedPromotions[0].couponPlan.consumeAction,
  "CONSUME_ON_ORDER_PLACED",
);
assert.strictEqual(result.appliedPromotions[0].budgetPlan.action, "RESERVE");
assert.strictEqual(result.rollbackPlan.length, 2);
assert(
  result.rollbackPlan.every(
    (plan) => plan.releaseAction === "RELEASE_ON_CHECKOUT_ROLLBACK",
  ),
);

const exhausted = evaluator.evaluate({
  context,
  campaigns: [
    {
      campaignCode: "summer",
      status: "ACTIVE",
      budgetLimitAmount: "25.00",
      budgetConsumedAmount: "20.00",
    },
  ],
  rules: [rules[0]],
  conditions: [conditions[0]],
  actions: [actions[0]],
  couponCampaigns,
  couponCodes,
});
assert.strictEqual(exhausted.appliedPromotions.length, 0);
assert.strictEqual(
  exhausted.rejectedPromotions[0].reasonCode,
  "PROMOTION_BUDGET_EXHAUSTED",
);

const couponMissing = evaluator.evaluate({
  context: Object.assign({}, context, { couponCode: undefined }),
  campaigns,
  rules: [rules[0]],
  conditions: [conditions[0]],
  actions: [actions[0]],
  couponCampaigns,
  couponCodes,
});
assert.strictEqual(couponMissing.appliedPromotions.length, 0);
assert.strictEqual(
  couponMissing.rejectedPromotions[0].reasonCode,
  "COUPON_REQUIRED",
);

const capped = evaluator.discountForAction(
  { discountRate: "50.00", maxDiscountAmount: "15.00", targetType: "CART" },
  context,
);
assert.strictEqual(capped, "15.00");

console.log("Promotion evaluation contract validated");
