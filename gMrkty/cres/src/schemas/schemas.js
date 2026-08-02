/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gMrkty/cres/src/schemas/schemas
 * @description Defines cres schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner cres
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  cres: {
    customerReview: {
      super: "base",
      schemaPolicies: ["reviewManaged"],
      backoffice: {
        enabled: true,
        label: "Customer Review",
        displayProperty: "code",
        displayProperties: [
          "code",
          "targetType",
          "targetCode",
          "rating",
          "status",
        ],
        searchableFields: [
          "code",
          "targetCode",
          "customerCode",
          "orderCode",
          "title",
          "comment",
        ],
        sortableFields: [
          "code",
          "targetType",
          "targetCode",
          "rating",
          "status",
          "created",
          "updated",
        ],
        filterFields: [
          "targetType",
          "targetCode",
          "customerCode",
          "rating",
          "status",
          "localeCode",
          "channelCode",
        ],
        defaultSortField: "created",
        defaultSortDirection: "DESC",
      },
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: false,
        ttl: 10,
      },
      search: {
        enabled: false,
        idPropertyName: "code",
      },
      definition: {
        targetType: {
          type: "string",
          required: true,
          description:
            "Reviewed business target type such as PRODUCT, CATEGORY, ORDER, STORE, CONTENT, or CUSTOM",
          searchOptions: { enabled: true },
        },
        targetCode: {
          type: "string",
          required: true,
          description:
            "Reviewed business target code owned by the target module",
          searchOptions: { enabled: true },
        },
        customerCode: {
          type: "string",
          required: true,
          description:
            "Customer principal or profile code that submitted the review",
          searchOptions: { enabled: true },
        },
        orderCode: {
          type: "string",
          required: false,
          description: "Optional purchase evidence order code",
        },
        orderEntryCode: {
          type: "string",
          required: false,
          description: "Optional purchase evidence order-entry code",
        },
        rating: {
          type: "int",
          required: true,
          description: "Rating value bounded by CRES rating policy",
        },
        title: {
          type: "string",
          required: false,
          description: "Short customer-facing review title",
        },
        comment: {
          type: "string",
          required: false,
          description: "Customer review body",
        },
        status: {
          type: "string",
          required: true,
          default: "PENDING",
          enum: [
            "DRAFT",
            "PENDING",
            "APPROVED",
            "REJECTED",
            "SPAM",
            "ARCHIVED",
          ],
          description: "Review lifecycle status",
        },
        localeCode: {
          type: "string",
          required: false,
          description: "Optional locale of the review",
        },
        channelCode: {
          type: "string",
          required: false,
          description: "Optional channel where the review was submitted",
        },
        mediaCodes: {
          type: "array",
          required: false,
          description:
            "Optional nMedia-owned media codes attached as review evidence",
        },
        moderationReason: {
          type: "string",
          required: false,
          description: "Latest bounded moderation reason visible to operators",
        },
      },
      indexes: {
        individual: {
          targetType: { enabled: true, name: "targetType" },
          targetCode: { enabled: true, name: "targetCode" },
          customerCode: { enabled: true, name: "customerCode" },
          status: { enabled: true, name: "status" },
          rating: { enabled: true, name: "rating" },
        },
      },
    },
    customerReviewModerationEvent: {
      super: "base",
      schemaPolicies: ["reviewAdministrative"],
      model: true,
      service: { enabled: true },
      router: { enabled: false },
      cache: { enabled: false, ttl: 10 },
      refSchema: {
        reviewCode: {
          enabled: true,
          schemaName: "customerReview",
          type: "one",
          propertyName: "code",
          searchEnabled: true,
        },
      },
      definition: {
        reviewCode: {
          type: "string",
          required: true,
        },
        eventType: {
          type: "string",
          required: true,
          enum: [
            "SUBMIT",
            "APPROVE",
            "REJECT",
            "MARK_SPAM",
            "ARCHIVE",
            "RESTORE",
            "REPORT_ABUSE",
            "CLEAR_REPORT",
          ],
          description: "Moderation lifecycle event",
        },
        fromStatus: {
          type: "string",
          required: false,
        },
        toStatus: {
          type: "string",
          required: false,
        },
        reasonCode: {
          type: "string",
          required: false,
        },
        actorCode: {
          type: "string",
          required: false,
          description: "Customer, employee, service, or workflow actor code",
        },
        evidence: {
          type: "object",
          required: false,
          description:
            "Safe moderation evidence without raw secrets or abusive payload expansion",
        },
        correlationId: {
          type: "string",
          required: false,
        },
      },
    },
    customerReviewAbuseReport: {
      super: "base",
      schemaPolicies: ["reviewManaged"],
      backoffice: {
        enabled: true,
        label: "Customer Review Abuse Report",
        displayProperty: "code",
        displayProperties: ["code", "reviewCode", "reporterCode", "status"],
        searchableFields: ["code", "reviewCode", "reporterCode", "reasonCode"],
        filterFields: ["reviewCode", "reporterCode", "status", "reasonCode"],
      },
      model: true,
      service: { enabled: true },
      router: { enabled: true },
      cache: { enabled: false, ttl: 10 },
      refSchema: {
        reviewCode: {
          enabled: true,
          schemaName: "customerReview",
          type: "one",
          propertyName: "code",
          searchEnabled: true,
        },
      },
      definition: {
        reviewCode: {
          type: "string",
          required: true,
          description: "Reported review code",
          searchOptions: { enabled: true },
        },
        reporterCode: {
          type: "string",
          required: true,
          description: "Customer or employee that reported the review",
          searchOptions: { enabled: true },
        },
        reasonCode: {
          type: "string",
          required: true,
          description: "Configured abuse-report reason code",
          searchOptions: { enabled: true },
        },
        comment: {
          type: "string",
          required: false,
          description: "Optional bounded report comment",
        },
        status: {
          type: "string",
          required: true,
          default: "OPEN",
          enum: ["OPEN", "UNDER_REVIEW", "ACTIONED", "DISMISSED"],
          description: "Abuse report lifecycle status",
          searchOptions: { enabled: true },
        },
        resolutionCode: { type: "string", required: false },
        moderationEventCode: { type: "string", required: false },
      },
    },
    customerReviewAggregate: {
      super: "base",
      schemaPolicies: ["reviewAdministrative"],
      backoffice: {
        enabled: true,
        label: "Customer Review Aggregate",
        displayProperty: "code",
        displayProperties: [
          "code",
          "targetType",
          "targetCode",
          "averageRating",
          "approvedReviewCount",
        ],
        searchableFields: ["code", "targetCode"],
        filterFields: ["targetType", "targetCode"],
      },
      model: true,
      service: { enabled: true },
      router: { enabled: true },
      cache: { enabled: true, ttl: 120 },
      definition: {
        targetType: {
          type: "string",
          required: true,
          description: "Aggregated target type",
          searchOptions: { enabled: true },
        },
        targetCode: {
          type: "string",
          required: true,
          description: "Aggregated target code",
          searchOptions: { enabled: true },
        },
        ratingTotal: {
          type: "string",
          required: true,
          default: "0",
          description: "Exact decimal rating total used for averages",
        },
        reviewCount: {
          type: "int",
          required: true,
          default: 0,
          description: "All review count",
        },
        approvedReviewCount: {
          type: "int",
          required: true,
          default: 0,
          description: "Approved review count",
        },
        averageRating: {
          type: "string",
          required: true,
          default: "0.00",
          description: "Exact decimal average rating",
        },
        lastReviewCode: { type: "string", required: false },
        lastCalculatedAt: { type: "date", required: false },
      },
      indexes: {
        individual: {
          targetType: { enabled: true, name: "targetType" },
          targetCode: { enabled: true, name: "targetCode" },
        },
        composite: {
          targetType: {
            enabled: true,
            name: "targetType",
            options: { unique: true },
          },
          targetCode: {
            enabled: true,
            name: "targetCode",
            options: { unique: true },
          },
        },
      },
    },
  },
};
