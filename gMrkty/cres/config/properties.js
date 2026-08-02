/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gMrkty/cres/config/properties
 * @description Defines default cres configuration used during module startup and layering.
 * @layer config
 * @owner cres
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  schemaPolicies: {
    cres: {
      reviewManaged: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
          customerUserGroup: 1,
        },
      },
      reviewAdministrative: {
        accessGroups: {
          adminGroup: 10,
          runtimeConfigAdminUserGroup: 10,
          serviceAccountUserGroup: 10,
        },
      },
    },
  },
  backofficeCapabilities: {
    cres: {
      enabled: true,
      capabilityId: "customer-review-system",
      displayName: "Customer Reviews",
      category: "commerce",
      icon: "review",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      requiredPermissions: ["cres.backoffice.view"],
      navigation: [
        {
          id: "customer-reviews",
          label: "Customer Reviews",
          route: "/commerce/reviews",
          icon: "review",
          order: 500,
          group: {
            id: "commerce-operations",
            label: "Commerce Operations",
            order: 350,
          },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise", "site", "catalog"],
          workbenchTarget: { moduleName: "cres", schemaName: "customerReview" },
          help: {
            summary:
              "Moderate customer reviews and ratings while CRES owns review lifecycle, abuse reports, and aggregate evidence.",
            documentationRoute:
              "/docs/capabilities/commerce/customer-reviews-and-ratings",
            documentationFragment: "customer-review-system",
          },
          featureState: "PREVIEW",
          requiredPermissions: ["cres.backoffice.view"],
        },
        {
          id: "review-aggregates",
          parentId: "customer-reviews",
          label: "Review Aggregates",
          route: "/commerce/reviews/aggregates",
          icon: "review",
          order: 510,
          group: {
            id: "commerce-operations",
            label: "Commerce Operations",
            order: 350,
          },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise", "site", "catalog"],
          workbenchTarget: {
            moduleName: "cres",
            schemaName: "customerReviewAggregate",
          },
          help: {
            summary:
              "Inspect calculated rating totals and averages by reviewed business target.",
            documentationRoute:
              "/docs/capabilities/commerce/customer-reviews-and-ratings",
            documentationFragment: "aggregate-ratings",
          },
          featureState: "PREVIEW",
          requiredPermissions: ["cres.backoffice.view"],
        },
        {
          id: "review-abuse-reports",
          parentId: "customer-reviews",
          label: "Review Abuse Reports",
          route: "/commerce/reviews/abuse-reports",
          icon: "review",
          order: 520,
          group: {
            id: "commerce-operations",
            label: "Commerce Operations",
            order: 350,
          },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise", "site", "catalog"],
          workbenchTarget: {
            moduleName: "cres",
            schemaName: "customerReviewAbuseReport",
          },
          help: {
            summary:
              "Review reports of abusive or inappropriate customer-review content through governed moderation workflow.",
            documentationRoute:
              "/docs/capabilities/commerce/customer-reviews-and-ratings",
            documentationFragment: "abuse-reporting",
          },
          featureState: "PREVIEW",
          requiredPermissions: ["cres.backoffice.view"],
        },
      ],
    },
  },
  cres: {
    review: {
      allowedTargetTypes: [
        "PRODUCT",
        "CATEGORY",
        "ORDER",
        "ORDER_ENTRY",
        "STORE",
        "CONTENT",
        "CUSTOM",
      ],
      statuses: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "SPAM",
        "ARCHIVED",
      ],
      defaultStatus: "PENDING",
      ratingMinimum: 1,
      ratingMaximum: 5,
      maximumTitleLength: 160,
      maximumCommentLength: 5000,
      requirePurchaseEvidenceForProducts: false,
    },
    moderation: {
      eventTypes: [
        "SUBMIT",
        "APPROVE",
        "REJECT",
        "MARK_SPAM",
        "ARCHIVE",
        "RESTORE",
        "REPORT_ABUSE",
        "CLEAR_REPORT",
      ],
      abuseStatuses: ["OPEN", "UNDER_REVIEW", "ACTIONED", "DISMISSED"],
      defaultAbuseStatus: "OPEN",
    },
  },
};
