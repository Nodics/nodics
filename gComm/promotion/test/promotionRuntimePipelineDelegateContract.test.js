/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/test/promotionRuntimePipelineDelegateContract
 * @description Protects Promotion runtime delegates used by Cart and Order
 * calculation pipelines, including optional evidence persistence and
 * coupon/budget consume/release operations.
 * @layer test
 * @owner promotion
 * @override Customer modules may replace Promotion evaluator/runtime services
 * while preserving Cart/Order delegate contracts and Promotion-owned evidence.
 */
const assert = require("assert");

const properties = require("../config/properties").promotion;
const evaluator = require("../src/service/foundation/defaultPromotionEvaluationService");
const scopeService = require("../src/service/foundation/defaultPromotionEnterpriseScopeService");

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

const persisted = {
  evaluationRuns: [],
  appliedPromotions: [],
};
const coupons = [
  {
    code: "coupon-SAVE10",
    couponCode: "SAVE10",
    redemptionCount: 0,
    maxRedemptions: 2,
  },
];
const campaigns = [
  {
    code: "campaign-summer",
    campaignCode: "summer",
    status: "ACTIVE",
    budgetLimitAmount: "100.00",
    budgetConsumedAmount: "20.00",
  },
];

global.SERVICE = {
  DefaultPromotionEnterpriseScopeService: scopeService,
  DefaultPromotionEvaluationRunService: {
    save: async (request) => {
      persisted.evaluationRuns.push(request.model);
      return { result: request.model };
    },
  },
  DefaultAppliedPromotionService: {
    save: async (request) => {
      persisted.appliedPromotions.push(request.model);
      return { result: request.model };
    },
  },
  DefaultCouponCodeService: {
    get: async () => ({ result: coupons }),
    update: async (request) => {
      coupons[0].redemptionCount = request.model.redemptionCount;
      return { result: coupons[0] };
    },
  },
  DefaultPromotionCampaignService: {
    get: async () => ({ result: campaigns }),
    update: async (request) => {
      campaigns[0].budgetConsumedAmount = request.model.budgetConsumedAmount;
      return { result: campaigns[0] };
    },
  },
};

const promotionRecords = {
  campaigns,
  rules: [
    {
      ruleCode: "cart-ten-percent",
      campaignCode: "summer",
      status: "ACTIVE",
      ruleType: "CART",
      priority: 10,
      conditionMode: "ALL",
      couponRequired: true,
    },
  ],
  conditions: [
    {
      conditionCode: "cart-over-100",
      ruleCode: "cart-ten-percent",
      status: "ACTIVE",
      fieldPath: "source.subtotalAmount",
      operator: "GREATER_THAN_OR_EQUALS",
      value: { amount: "100.00" },
    },
  ],
  actions: [
    {
      actionCode: "ten-percent",
      ruleCode: "cart-ten-percent",
      status: "ACTIVE",
      actionType: "ORDER_PERCENTAGE_DISCOUNT",
      targetType: "CART",
      discountRate: "10.00",
      taxTreatment: "BEFORE_TAX",
    },
  ],
  couponCampaigns: [
    {
      couponCampaignCode: "summer-coupons",
      ruleCode: "cart-ten-percent",
      status: "ACTIVE",
    },
  ],
  couponCodes: [
    {
      couponCode: "SAVE10",
      couponCampaignCode: "summer-coupons",
      redemptionCount: 0,
      maxRedemptions: 2,
      status: "ACTIVE",
    },
  ],
};

(async () => {
  const result = await evaluator.evaluateCart({
    tenant: "default",
    authData: { enterprise: { code: "enterpriseA" } },
    calculationInput: {
      cartCode: "cart-100",
      cart: {
        code: "cart-100",
        subtotalAmount: "120.00",
        currencyCode: "USD",
        couponCode: "SAVE10",
      },
      promotionRecords,
    },
  });

  assert.strictEqual(result.evaluationRun.sourceType, "CART");
  assert.strictEqual(result.evaluationRun.sourceCode, "cart-100");
  assert.strictEqual(result.evaluationRun.discountTotal, "12.00");
  assert.strictEqual(result.appliedPromotions.length, 1);
  assert.strictEqual(result.persistence.persisted, true);
  assert.strictEqual(persisted.evaluationRuns.length, 1);
  assert.strictEqual(persisted.appliedPromotions.length, 1);

  const consumed = await evaluator.consumeReservations({
    evaluationResult: result,
  });
  assert.strictEqual(consumed.status, "CONSUMED");
  assert.strictEqual(coupons[0].redemptionCount, 1);
  assert.strictEqual(campaigns[0].budgetConsumedAmount, "32.00");

  const released = await evaluator.releaseReservations({
    evaluationResult: result,
  });
  assert.strictEqual(released.status, "RELEASED");
  assert(
    released.released.some(
      (item) => item.reasonCode === "COUPON_HOLD_RELEASED_WITHOUT_REDEMPTION",
    ),
  );

  const orderResult = await evaluator.reconcileOrder({
    tenant: "default",
    authData: { enterprise: { code: "enterpriseA" } },
    calculationInput: {
      orderCode: "order-100",
      order: {
        code: "order-100",
        subtotalAmount: "120.00",
        currencyCode: "USD",
        couponCode: "SAVE10",
      },
      promotionRecords: Object.assign({}, promotionRecords, {
        rules: [
          Object.assign({}, promotionRecords.rules[0], {
            ruleType: "ORDER",
          }),
        ],
        actions: [
          Object.assign({}, promotionRecords.actions[0], {
            targetType: "ORDER",
          }),
        ],
      }),
    },
  });
  assert.strictEqual(orderResult.evaluationRun.sourceType, "ORDER");
  assert.strictEqual(orderResult.evaluationRun.sourceCode, "order-100");
  assert.strictEqual(orderResult.evaluationRun.discountTotal, "12.00");

  console.log("Promotion runtime pipeline delegate contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
