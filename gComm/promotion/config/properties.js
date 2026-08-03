/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/config/properties @description Layered promotion, coupon, and discount policy configuration. @layer configuration @owner promotion */
module.exports = {
  backofficeCapabilities: {
    promotion: {
      enabled: true,
      capabilityId: "promotion-management",
      displayName: "Promotion",
      category: "commerce",
      icon: "promotion",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      requiredPermissions: ["promotion.backoffice.read"],
      navigation: [
        {
          id: "promotions",
          parentId: "commerce-operations",
          parentModuleName: "pricing",
          label: "Promotions",
          route: "/commerce/operations/promotions",
          icon: "promotion",
          order: 545,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "promotionCampaign",
          },
          detailPanels: [
            {
              id: "promotion-rules",
              label: "Rules",
              target: { moduleName: "promotion", schemaName: "promotionRule" },
              relation: {
                sourceField: "campaignCode",
                targetField: "campaignCode",
              },
            },
            {
              id: "coupon-campaigns",
              label: "Coupon Campaigns",
              target: { moduleName: "promotion", schemaName: "couponCampaign" },
              relation: {
                sourceField: "campaignCode",
                targetField: "campaignCode",
              },
            },
          ],
          help: {
            summary:
              "Manage promotion campaigns, rules, coupons, evaluation runs, and applied-discount evidence without moving price, tax, cart, or order authority into Promotion.",
            documentationRoute: "/docs/capabilities/commerce/promotions",
          },
        },
        {
          id: "promotion-rules",
          parentId: "promotions",
          label: "Promotion Rules",
          route: "/commerce/operations/promotions/rules",
          icon: "promotion",
          order: 546,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "promotionRule",
          },
          workbenchPresentation: {
            defaultColumns: [
              "ruleCode",
              "campaignCode",
              "ruleType",
              "priority",
              "couponRequired",
              "exclusive",
              "status",
            ],
            detailSections: [
              {
                id: "rule-authoring",
                label: "Rule Authoring",
                fields: [
                  "ruleCode",
                  "name",
                  "ruleType",
                  "evaluationStrategy",
                  "conditionMode",
                  "priority",
                ],
              },
              {
                id: "stacking-and-coupons",
                label: "Stacking and Coupons",
                fields: [
                  "stackabilityGroup",
                  "exclusive",
                  "couponRequired",
                  "maxApplications",
                ],
              },
            ],
          },
          detailPanels: [
            {
              id: "promotion-conditions",
              label: "Conditions",
              target: {
                moduleName: "promotion",
                schemaName: "promotionCondition",
              },
              relation: { sourceField: "ruleCode", targetField: "ruleCode" },
            },
            {
              id: "promotion-actions",
              label: "Actions",
              target: {
                moduleName: "promotion",
                schemaName: "promotionAction",
              },
              relation: { sourceField: "ruleCode", targetField: "ruleCode" },
            },
          ],
          help: {
            summary:
              "Author safe rule metadata using configured conditions and actions. Evaluation services interpret this metadata; records never contain executable code.",
            documentationRoute: "/docs/capabilities/commerce/promotions/rules",
          },
        },
        {
          id: "promotion-conditions",
          parentId: "promotions",
          label: "Promotion Conditions",
          route: "/commerce/operations/promotions/conditions",
          icon: "promotion",
          order: 547,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "promotionCondition",
          },
          help: {
            summary:
              "Maintain bounded condition records such as item, category, cart total, customer group, channel, or coupon checks.",
            documentationRoute:
              "/docs/capabilities/commerce/promotions/conditions",
          },
        },
        {
          id: "promotion-actions",
          parentId: "promotions",
          label: "Promotion Actions",
          route: "/commerce/operations/promotions/actions",
          icon: "promotion",
          order: 548,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "promotionAction",
          },
          help: {
            summary:
              "Maintain configured discount actions such as item discount, order discount, free shipping, or free gift metadata.",
            documentationRoute:
              "/docs/capabilities/commerce/promotions/actions",
          },
        },
        {
          id: "coupons",
          parentId: "promotions",
          label: "Coupons",
          route: "/commerce/operations/promotions/coupons",
          icon: "promotion",
          order: 549,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "couponCampaign",
          },
          detailPanels: [
            {
              id: "coupon-codes",
              label: "Coupon Codes",
              target: { moduleName: "promotion", schemaName: "couponCode" },
              relation: {
                sourceField: "couponCampaignCode",
                targetField: "couponCampaignCode",
              },
            },
          ],
          help: {
            summary:
              "Manage coupon campaigns and safe coupon-code evidence used by promotion rules and redemption checks.",
            documentationRoute:
              "/docs/capabilities/commerce/promotions/coupons",
          },
        },
        {
          id: "coupon-codes",
          parentId: "coupons",
          label: "Coupon Codes",
          route: "/commerce/operations/promotions/coupon-codes",
          icon: "promotion",
          order: 550,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "couponCode",
          },
          help: {
            summary:
              "Review coupon-code lifecycle, optional customer assignment, and redemption-count evidence.",
            documentationRoute:
              "/docs/capabilities/commerce/promotions/coupon-codes",
          },
        },
        {
          id: "promotion-evaluations",
          parentId: "promotions",
          label: "Promotion Evaluations",
          route: "/commerce/operations/promotions/evaluations",
          icon: "promotion",
          order: 551,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "promotionEvaluationRun",
          },
          detailPanels: [
            {
              id: "applied-promotions",
              label: "Applied Discounts",
              target: {
                moduleName: "promotion",
                schemaName: "appliedPromotion",
              },
              relation: {
                sourceField: "evaluationCode",
                targetField: "evaluationCode",
              },
            },
          ],
          help: {
            summary:
              "Inspect evaluation-run evidence created by promotion services before Cart or Order accepts frozen discount totals.",
            documentationRoute:
              "/docs/capabilities/commerce/promotions/evaluations",
          },
        },
        {
          id: "applied-promotions",
          parentId: "promotions",
          label: "Applied Discounts",
          route: "/commerce/operations/promotions/applied",
          icon: "promotion",
          order: 552,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "appliedPromotion",
          },
          workbenchPresentation: {
            defaultColumns: [
              "appliedPromotionCode",
              "ruleCode",
              "sourceType",
              "targetType",
              "discountAmount",
              "currencyCode",
              "taxTreatment",
              "status",
            ],
            detailSections: [
              {
                id: "discount-evidence",
                label: "Discount Evidence",
                fields: [
                  "evaluationCode",
                  "campaignCode",
                  "ruleCode",
                  "actionCode",
                  "couponCode",
                  "actionType",
                ],
              },
              {
                id: "commercial-impact",
                label: "Commercial Impact",
                fields: [
                  "sourceType",
                  "sourceCode",
                  "targetType",
                  "targetCode",
                  "discountAmount",
                  "discountRate",
                  "currencyCode",
                  "taxTreatment",
                ],
              },
            ],
          },
          help: {
            summary:
              "Review immutable applied-discount evidence used by Cart, Order, Tax, Payment, and Refund flows.",
            documentationRoute:
              "/docs/capabilities/commerce/promotions/applied-discounts",
          },
        },
        {
          id: "promotion-repair-runs",
          parentId: "promotions",
          label: "Promotion Repair Runs",
          route: "/commerce/operations/promotions/repair-runs",
          icon: "promotion",
          order: 553,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["promotion.backoffice.read"],
          workbenchTarget: {
            moduleName: "promotion",
            schemaName: "promotionRepairRun",
          },
          workbenchPresentation: {
            defaultColumns: [
              "repairRunCode",
              "operationType",
              "evaluationCode",
              "status",
              "retryCount",
              "failureCode",
            ],
            detailSections: [
              {
                id: "repair-context",
                label: "Repair Context",
                fields: [
                  "repairRunCode",
                  "operationType",
                  "evaluationCode",
                  "sourceType",
                  "sourceCode",
                  "workflowCarrierCode",
                ],
              },
              {
                id: "repair-outcome",
                label: "Repair Outcome",
                fields: [
                  "status",
                  "retryCount",
                  "newEvaluationCode",
                  "failureCode",
                  "failureMessage",
                  "requestedAt",
                  "completedAt",
                ],
              },
            ],
          },
          help: {
            summary:
              "Inspect service-token-only Promotion repair, retry, and reconciliation evidence without rewriting immutable evaluation records.",
            documentationRoute:
              "/docs/capabilities/commerce/promotions/repair-runs",
          },
        },
      ],
    },
  },
  promotion: {
    runtime: {
      persistEvaluationEvidence: true,
      maximumEvaluationRecords: 1000,
      activeStatuses: ["ACTIVE", "EVALUATED"],
    },
    workflow: {
      enabled: true,
      defaultMode: "MANUAL",
      modes: ["MANUAL", "AUTOMATIC"],
      manualWorkflowCode: "promotionLifecycleManualFlow",
      automaticWorkflowCode: "promotionLifecycleAutomaticFlow",
      operationModes: {
        APPROVE_CAMPAIGN: "MANUAL",
        APPROVE_RULE: "MANUAL",
        REPAIR_EVALUATION: "AUTOMATIC",
        RETRY_EVALUATION: "AUTOMATIC",
        RECONCILE_EVIDENCE: "AUTOMATIC",
      },
      approvalOperations: ["APPROVE_CAMPAIGN", "APPROVE_RULE"],
      repairOperations: [
        "REPAIR_EVALUATION",
        "RETRY_EVALUATION",
        "RECONCILE_EVIDENCE",
      ],
    },
    reconciliation: {
      enabled: true,
      maximumAggregateRecords: 1000,
      retryStatuses: ["REQUESTED", "FAILED", "PARTIAL"],
      terminalSuccessStatuses: ["REPAIRED", "RECONCILED", "NO_REPAIR_REQUIRED"],
      maximumRetries: 3,
      failureMessageLimit: 240,
      repairableFailureCodes: [
        "PROMOTION_RUNTIME_FAILED",
        "PROMOTION_EVIDENCE_INCOMPLETE",
        "PROMOTION_RULE_UNAVAILABLE",
      ],
    },
    identity: {
      codePattern: "^[A-Za-z0-9][A-Za-z0-9._-]*$",
      separator: "::",
      maxCodeLength: 160,
    },
    enterpriseScope: { required: true },
    lifecycle: {
      editableStatuses: ["DRAFT", "ACTIVE", "SUSPENDED"],
      terminalStatuses: ["RETIRED", "EXPIRED", "REJECTED"],
      statuses: [
        "DRAFT",
        "ACTIVE",
        "SUSPENDED",
        "EXPIRED",
        "RETIRED",
        "EVALUATED",
        "APPLIED",
        "REQUESTED",
        "PARTIAL",
        "REPAIRED",
        "RECONCILED",
        "NO_REPAIR_REQUIRED",
        "REJECTED",
        "FAILED",
      ],
    },
    rule: {
      campaignTypes: [
        "MERCHANDISING",
        "COUPON",
        "LOYALTY",
        "CLEARANCE",
        "PROJECT",
      ],
      ruleTypes: ["CART", "ENTRY", "DELIVERY", "PAYMENT", "ORDER"],
      evaluationStrategies: ["DECLARATIVE_RULE", "PROJECT_SERVICE", "EXTERNAL"],
      conditionModes: ["ALL", "ANY"],
      conditionTypes: [
        "ITEM",
        "CATEGORY",
        "CART_TOTAL",
        "CUSTOMER_GROUP",
        "CHANNEL",
        "COUPON",
        "PROJECT",
      ],
      operators: [
        "EQUALS",
        "NOT_EQUALS",
        "IN",
        "NOT_IN",
        "GREATER_THAN_OR_EQUALS",
        "LESS_THAN_OR_EQUALS",
        "EXISTS",
      ],
      actionTypes: [
        "ENTRY_FIXED_DISCOUNT",
        "ENTRY_PERCENTAGE_DISCOUNT",
        "ORDER_FIXED_DISCOUNT",
        "ORDER_PERCENTAGE_DISCOUNT",
        "FREE_SHIPPING",
        "FREE_GIFT",
        "PROJECT",
      ],
      targetTypes: ["CART", "ENTRY", "DELIVERY", "PAYMENT", "ORDER"],
      taxTreatments: ["BEFORE_TAX", "AFTER_TAX", "TAX_INCLUSIVE_ADJUSTMENT"],
    },
    coupon: {
      couponTypes: ["SINGLE_CODE", "MULTI_CODE", "CUSTOMER_ASSIGNED"],
    },
    decimals: {
      maximumDigits: 38,
      maximumScale: 18,
    },
  },
};
