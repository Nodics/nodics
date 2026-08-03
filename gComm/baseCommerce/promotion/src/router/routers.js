/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/src/router/routers @description Internal Promotion repair and reconciliation route definitions. @layer definition @owner promotion */
module.exports = {
  promotion: {
    promotionRepair: {
      repairEvaluation: {
        secured: true,
        accessGroups: ["userGroup"],
        permissionConfig: "authSecurity.internalToken.routePermission",
        apiExposure: "moduleInternal",
        key: "/internal/promotions/repair",
        method: "POST",
        controller: "DefaultPromotionRepairController",
        operation: "repair",
        responses: {
          200: {
            description: "Service-token-only Promotion repair run evidence",
          },
        },
      },
      retryEvaluation: {
        secured: true,
        accessGroups: ["userGroup"],
        permissionConfig: "authSecurity.internalToken.routePermission",
        apiExposure: "moduleInternal",
        key: "/internal/promotions/retry",
        method: "POST",
        controller: "DefaultPromotionRepairController",
        operation: "retry",
        responses: {
          200: {
            description: "Service-token-only Promotion retry run evidence",
          },
        },
      },
      reconcileEvaluations: {
        secured: true,
        accessGroups: ["userGroup"],
        permissionConfig: "authSecurity.internalToken.routePermission",
        apiExposure: "moduleInternal",
        key: "/internal/promotions/reconcile",
        method: "POST",
        controller: "DefaultPromotionRepairController",
        operation: "reconcile",
        responses: {
          200: {
            description: "Service-token-only Promotion reconciliation trigger",
          },
        },
      },
    },
  },
};
