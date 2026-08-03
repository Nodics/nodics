/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/src/schemas/schemas @description Promotion campaign, rule, condition, action, coupon, evaluation, and applied-discount evidence schemas. @layer schema @owner promotion */
const governed = function (definition, indexes, refSchema) {
  const schema = {
    super: "base",
    model: true,
    service: { enabled: true },
    router: { enabled: false },
    cache: { enabled: false },
    search: { enabled: false },
    event: { enabled: false },
    definition: definition,
    indexes: indexes || {},
  };
  if (refSchema) schema.refSchema = refSchema;
  return schema;
};

const common = function () {
  return {
    enterpriseCode: {
      type: "string",
      required: true,
      description: "Authenticated enterprise owner of the Promotion record",
      searchOptions: { enabled: true },
    },
    status: {
      type: "string",
      required: true,
      default: "DRAFT",
      description: "Governed lifecycle status",
      searchOptions: { enabled: true },
    },
    effectiveFrom: {
      type: "date",
      required: false,
      description: "Optional lifecycle or validity start",
    },
    effectiveTo: {
      type: "date",
      required: false,
      description: "Optional lifecycle or validity end",
    },
    approvedBy: {
      type: "string",
      required: false,
      description: "Human principal that approved this promotion record",
      searchOptions: { enabled: true },
    },
    approvedAt: {
      type: "date",
      required: false,
      description: "Timestamp when this promotion record was approved",
    },
    workflowCarrierCode: {
      type: "string",
      required: false,
      description:
        "Workflow carrier that governed the latest lifecycle decision",
      searchOptions: { enabled: true },
    },
    lastWorkflowDecision: {
      type: "string",
      required: false,
      description: "Latest governed workflow decision",
      searchOptions: { enabled: true },
    },
  };
};

const moneyFields = function () {
  return {
    currencyCode: {
      type: "string",
      required: false,
      description: "ISO-style currency code for monetary discount evidence",
      searchOptions: { enabled: true },
    },
    discountAmount: {
      type: "string",
      required: false,
      description: "Exact decimal-string discount amount evidence",
    },
    discountRate: {
      type: "string",
      required: false,
      description: "Exact decimal-string percentage or ratio evidence",
    },
  };
};

module.exports = {
  promotion: {
    promotionCampaign: governed(
      Object.assign(common(), {
        campaignCode: {
          type: "string",
          required: true,
          description: "Stable promotion campaign identity",
          searchOptions: { enabled: true },
        },
        name: { type: "string", required: true },
        description: { type: "string", required: false },
        campaignType: {
          type: "string",
          required: true,
          default: "MERCHANDISING",
          description:
            "Campaign type such as MERCHANDISING, COUPON, LOYALTY, CLEARANCE, or PROJECT",
          searchOptions: { enabled: true },
        },
        priority: { type: "int", required: true, default: 100 },
        budgetCode: {
          type: "string",
          required: false,
          description: "Optional promotion budget or finance reference",
          searchOptions: { enabled: true },
        },
        budgetLimitAmount: {
          type: "string",
          required: false,
          description:
            "Optional exact decimal-string promotion budget limit used by runtime reservation policy",
        },
        budgetConsumedAmount: {
          type: "string",
          required: false,
          description:
            "Optional exact decimal-string consumed budget evidence used by runtime reservation policy",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          campaignCode: { enabled: true, name: "campaignCode" },
        },
        individual: {
          campaignCode: { enabled: true, name: "campaignCode" },
          campaignType: { enabled: true, name: "campaignType" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    promotionRule: governed(
      Object.assign(common(), {
        ruleCode: {
          type: "string",
          required: true,
          description: "Stable promotion rule identity",
          searchOptions: { enabled: true },
        },
        campaignCode: {
          type: "string",
          required: false,
          description: "Optional owning campaign code",
          searchOptions: { enabled: true },
        },
        name: { type: "string", required: true },
        ruleType: {
          type: "string",
          required: true,
          default: "CART",
          description:
            "Rule type such as CART, ENTRY, DELIVERY, PAYMENT, or ORDER",
          searchOptions: { enabled: true },
        },
        priority: { type: "int", required: true, default: 100 },
        stackabilityGroup: {
          type: "string",
          required: false,
          description: "Optional stacking group used by promotion arbitration",
          searchOptions: { enabled: true },
        },
        exclusive: {
          type: "bool",
          required: true,
          default: false,
          description:
            "Whether this rule blocks lower-priority stackable rules",
        },
        couponRequired: {
          type: "bool",
          required: true,
          default: false,
          description: "Whether a valid coupon redemption is required",
        },
        evaluationStrategy: {
          type: "string",
          required: true,
          default: "DECLARATIVE_RULE",
          description:
            "Configured evaluator strategy. This is metadata, not executable code.",
          searchOptions: { enabled: true },
        },
        conditionMode: {
          type: "string",
          required: true,
          default: "ALL",
          description: "How child conditions combine, such as ALL or ANY",
        },
        maxApplications: {
          type: "int",
          required: false,
          description: "Optional maximum applications per evaluation",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          ruleCode: { enabled: true, name: "ruleCode" },
          campaignCode: { enabled: true, name: "campaignCode" },
        },
        individual: {
          ruleCode: { enabled: true, name: "ruleCode" },
          ruleType: { enabled: true, name: "ruleType" },
          status: { enabled: true, name: "status" },
        },
      },
      {
        campaignCode: {
          type: "one",
          module: "promotion",
          schema: "promotionCampaign",
          property: "campaignCode",
          onDelete: "restrict",
        },
      },
    ),
    promotionCondition: governed(
      Object.assign(common(), {
        conditionCode: {
          type: "string",
          required: true,
          description: "Stable condition identity",
          searchOptions: { enabled: true },
        },
        ruleCode: {
          type: "string",
          required: true,
          description: "Owning promotion rule code",
          searchOptions: { enabled: true },
        },
        conditionType: {
          type: "string",
          required: true,
          description:
            "Condition type such as ITEM, CATEGORY, CART_TOTAL, CUSTOMER_GROUP, CHANNEL, or COUPON",
          searchOptions: { enabled: true },
        },
        fieldPath: {
          type: "string",
          required: false,
          description: "Safe bounded field path interpreted by the evaluator",
        },
        operator: {
          type: "string",
          required: true,
          default: "EQUALS",
          description: "Configured comparison operator",
        },
        value: {
          type: "object",
          required: false,
          description: "Bounded condition value object, not executable code",
        },
        sequence: { type: "int", required: true, default: 100 },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          ruleCode: { enabled: true, name: "ruleCode" },
        },
        individual: {
          conditionCode: { enabled: true, name: "conditionCode" },
          conditionType: { enabled: true, name: "conditionType" },
          status: { enabled: true, name: "status" },
        },
      },
      {
        ruleCode: {
          type: "one",
          module: "promotion",
          schema: "promotionRule",
          property: "ruleCode",
          onDelete: "restrict",
        },
      },
    ),
    promotionAction: governed(
      Object.assign(common(), moneyFields(), {
        actionCode: {
          type: "string",
          required: true,
          description: "Stable action identity",
          searchOptions: { enabled: true },
        },
        ruleCode: {
          type: "string",
          required: true,
          description: "Owning promotion rule code",
          searchOptions: { enabled: true },
        },
        actionType: {
          type: "string",
          required: true,
          default: "ORDER_PERCENTAGE_DISCOUNT",
          description:
            "Action type such as ENTRY_FIXED_DISCOUNT, ENTRY_PERCENTAGE_DISCOUNT, ORDER_FIXED_DISCOUNT, ORDER_PERCENTAGE_DISCOUNT, FREE_SHIPPING, or FREE_GIFT",
          searchOptions: { enabled: true },
        },
        targetType: {
          type: "string",
          required: true,
          default: "CART",
          description:
            "Discount target type such as CART, ENTRY, DELIVERY, PAYMENT, or ORDER",
          searchOptions: { enabled: true },
        },
        maxDiscountAmount: {
          type: "string",
          required: false,
          description:
            "Optional exact decimal-string cap for percentage discounts",
        },
        sequence: { type: "int", required: true, default: 100 },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          ruleCode: { enabled: true, name: "ruleCode" },
        },
        individual: {
          actionCode: { enabled: true, name: "actionCode" },
          actionType: { enabled: true, name: "actionType" },
          targetType: { enabled: true, name: "targetType" },
          status: { enabled: true, name: "status" },
        },
      },
      {
        ruleCode: {
          type: "one",
          module: "promotion",
          schema: "promotionRule",
          property: "ruleCode",
          onDelete: "restrict",
        },
      },
    ),
    couponCampaign: governed(
      Object.assign(common(), {
        couponCampaignCode: {
          type: "string",
          required: true,
          description: "Stable coupon campaign identity",
          searchOptions: { enabled: true },
        },
        campaignCode: {
          type: "string",
          required: false,
          description: "Optional owning promotion campaign code",
          searchOptions: { enabled: true },
        },
        ruleCode: {
          type: "string",
          required: false,
          description: "Optional promotion rule requiring this coupon campaign",
          searchOptions: { enabled: true },
        },
        name: { type: "string", required: true },
        couponType: {
          type: "string",
          required: true,
          default: "MULTI_CODE",
          description:
            "Coupon type such as SINGLE_CODE, MULTI_CODE, or CUSTOMER_ASSIGNED",
          searchOptions: { enabled: true },
        },
        maxRedemptions: {
          type: "int",
          required: false,
          description: "Optional total redemption limit",
        },
        maxRedemptionsPerCustomer: {
          type: "int",
          required: false,
          description: "Optional per-customer redemption limit",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          couponCampaignCode: { enabled: true, name: "couponCampaignCode" },
        },
        individual: {
          couponCampaignCode: { enabled: true, name: "couponCampaignCode" },
          couponType: { enabled: true, name: "couponType" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    couponCode: governed(
      Object.assign(common(), {
        couponCode: {
          type: "string",
          required: true,
          description: "Safe coupon code or generated coupon token",
          searchOptions: { enabled: true },
        },
        couponCampaignCode: {
          type: "string",
          required: true,
          description: "Owning coupon campaign code",
          searchOptions: { enabled: true },
        },
        customerCode: {
          type: "string",
          required: false,
          description:
            "Optional customer assignment for customer-specific coupons",
          searchOptions: { enabled: true },
        },
        redemptionCount: {
          type: "int",
          required: true,
          default: 0,
          description: "Total successful redemptions recorded by Promotion",
        },
        maxRedemptions: {
          type: "int",
          required: false,
          description: "Optional coupon-code-level redemption limit",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          couponCampaignCode: { enabled: true, name: "couponCampaignCode" },
        },
        individual: {
          couponCode: {
            enabled: true,
            name: "couponCode",
            options: { unique: true },
          },
          customerCode: { enabled: true, name: "customerCode" },
          status: { enabled: true, name: "status" },
        },
      },
      {
        couponCampaignCode: {
          type: "one",
          module: "promotion",
          schema: "couponCampaign",
          property: "couponCampaignCode",
          onDelete: "restrict",
        },
      },
    ),
    promotionEvaluationRun: governed(
      Object.assign(common(), {
        evaluationCode: {
          type: "string",
          required: true,
          description: "Stable evaluation run identity",
          searchOptions: { enabled: true },
        },
        idempotencyKey: {
          type: "string",
          required: true,
          description: "Idempotency key supplied by Cart, Order, or Checkout",
          searchOptions: { enabled: true },
        },
        sourceType: {
          type: "string",
          required: true,
          description:
            "Evaluation source such as CART, ORDER, QUOTE, or PREVIEW",
          searchOptions: { enabled: true },
        },
        sourceCode: {
          type: "string",
          required: true,
          description: "Owning source business code",
          searchOptions: { enabled: true },
        },
        currencyCode: {
          type: "string",
          required: true,
          description: "Currency used during evaluation",
          searchOptions: { enabled: true },
        },
        subtotalAmount: {
          type: "string",
          required: true,
          description: "Exact decimal-string pre-discount subtotal evaluated",
        },
        discountTotal: {
          type: "string",
          required: true,
          description: "Exact decimal-string total discount calculated",
        },
        taxInclusionMode: {
          type: "string",
          required: false,
          description:
            "Tax inclusion context used when interpreting promotion totals",
          searchOptions: { enabled: true },
        },
        evaluatedRuleCodes: {
          type: "array",
          required: false,
          description: "Rule codes considered by the evaluator",
        },
        appliedRuleCodes: {
          type: "array",
          required: false,
          description: "Rule codes applied by the evaluator",
        },
        failureCode: {
          type: "string",
          required: false,
          description: "Safe failure code for rejected/failed evaluations",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          sourceType: { enabled: true, name: "sourceType" },
          sourceCode: { enabled: true, name: "sourceCode" },
        },
        individual: {
          evaluationCode: {
            enabled: true,
            name: "evaluationCode",
            options: { unique: true },
          },
          idempotencyKey: { enabled: true, name: "idempotencyKey" },
          status: { enabled: true, name: "status" },
        },
      },
    ),
    appliedPromotion: governed(
      Object.assign(common(), moneyFields(), {
        appliedPromotionCode: {
          type: "string",
          required: true,
          description: "Stable applied-promotion evidence identity",
          searchOptions: { enabled: true },
        },
        evaluationCode: {
          type: "string",
          required: true,
          description: "Owning evaluation run code",
          searchOptions: { enabled: true },
        },
        campaignCode: {
          type: "string",
          required: false,
          description: "Applied campaign code",
          searchOptions: { enabled: true },
        },
        ruleCode: {
          type: "string",
          required: true,
          description: "Applied promotion rule code",
          searchOptions: { enabled: true },
        },
        actionCode: {
          type: "string",
          required: false,
          description: "Applied promotion action code",
          searchOptions: { enabled: true },
        },
        couponCode: {
          type: "string",
          required: false,
          description: "Coupon code used for this discount evidence",
          searchOptions: { enabled: true },
        },
        sourceType: {
          type: "string",
          required: true,
          description: "Source such as CART, ORDER, QUOTE, or PREVIEW",
          searchOptions: { enabled: true },
        },
        sourceCode: {
          type: "string",
          required: true,
          description: "Source business code",
          searchOptions: { enabled: true },
        },
        targetType: {
          type: "string",
          required: true,
          description:
            "Target such as CART, ENTRY, DELIVERY, PAYMENT, or ORDER",
          searchOptions: { enabled: true },
        },
        targetCode: {
          type: "string",
          required: false,
          description:
            "Target line/allocation/group code when the discount is not cart-wide",
          searchOptions: { enabled: true },
        },
        actionType: {
          type: "string",
          required: true,
          description: "Applied action type that produced this discount",
          searchOptions: { enabled: true },
        },
        stackabilityGroup: {
          type: "string",
          required: false,
          description: "Stacking group used during arbitration",
          searchOptions: { enabled: true },
        },
        taxTreatment: {
          type: "string",
          required: true,
          default: "BEFORE_TAX",
          description:
            "Tax treatment such as BEFORE_TAX, AFTER_TAX, or TAX_INCLUSIVE_ADJUSTMENT",
          searchOptions: { enabled: true },
        },
        sequence: { type: "int", required: true, default: 100 },
        reasonCode: {
          type: "string",
          required: false,
          description: "Safe reason/audit code for this applied discount",
        },
      }),
      {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          sourceType: { enabled: true, name: "sourceType" },
          sourceCode: { enabled: true, name: "sourceCode" },
        },
        individual: {
          appliedPromotionCode: {
            enabled: true,
            name: "appliedPromotionCode",
            options: { unique: true },
          },
          evaluationCode: { enabled: true, name: "evaluationCode" },
          ruleCode: { enabled: true, name: "ruleCode" },
          targetType: { enabled: true, name: "targetType" },
          status: { enabled: true, name: "status" },
        },
      },
      {
        evaluationCode: {
          type: "one",
          module: "promotion",
          schema: "promotionEvaluationRun",
          property: "evaluationCode",
          onDelete: "restrict",
        },
        ruleCode: {
          type: "one",
          module: "promotion",
          schema: "promotionRule",
          property: "ruleCode",
          onDelete: "restrict",
        },
      },
    ),
  },
};
