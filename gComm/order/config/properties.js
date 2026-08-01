/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/config/properties
 * @description Reserved order property contribution for module-level configuration defaults.
 * @layer config
 * @owner order
 * @override Project modules may provide later property contributions for order lifecycle, validation, and integration settings.
 */
module.exports = {
  backofficeCapabilities: {
    order: {
      enabled: true,
      capabilityId: "order-management",
      displayName: "Orders",
      category: "commerce",
      icon: "commerce",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      navigation: [
        {
          id: "checkout",
          parentId: "commerce-operations",
          parentModuleName: "pricing",
          label: "Checkout",
          route: "/commerce/operations/checkout",
          icon: "commerce",
          order: 580,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["order.backoffice.read"],
          workbenchTarget: { moduleName: "order", schemaName: "order" },
          help: {
            summary:
              "Review checkout journey records such as orders, order statuses, payment statuses, and shipping statuses.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "orders",
          parentId: "checkout",
          label: "Orders",
          route: "/commerce/operations/checkout/orders",
          icon: "commerce",
          order: 582,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["order.backoffice.read"],
          workbenchTarget: { moduleName: "order", schemaName: "order" },
          help: {
            summary:
              "Review persisted order records through the Order capability.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "carts",
          parentId: "checkout",
          label: "Carts",
          route: "/commerce/operations/checkout/carts",
          icon: "cart",
          order: 581,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["cart.backoffice.read"],
          workbenchTarget: { moduleName: "cart", schemaName: "cart" },
          help: {
            summary:
              "Review persisted cart records through the Cart capability while checkout journey grouping stays in Commerce Operations.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "order-statuses",
          parentId: "checkout",
          label: "Order Statuses",
          route: "/commerce/operations/checkout/order-statuses",
          icon: "commerce",
          order: 583,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["order.backoffice.read"],
          workbenchTarget: { moduleName: "order", schemaName: "orderstatus" },
          help: {
            summary:
              "Maintain order-status reference records and sequencing used by order lifecycle flows.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "payment-statuses",
          parentId: "checkout",
          label: "Payment Statuses",
          route: "/commerce/operations/checkout/payment-statuses",
          icon: "commerce",
          order: 584,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["order.backoffice.read"],
          workbenchTarget: { moduleName: "order", schemaName: "paymentstatus" },
          help: {
            summary:
              "Maintain payment-status reference records used by order payment lifecycle tracking.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "shipping-statuses",
          parentId: "checkout",
          label: "Shipping Statuses",
          route: "/commerce/operations/checkout/shipping-statuses",
          icon: "commerce",
          order: 585,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["order.backoffice.read"],
          workbenchTarget: {
            moduleName: "order",
            schemaName: "shippingstatus",
          },
          help: {
            summary:
              "Maintain shipping-status reference records used by fulfillment and shipping lifecycle tracking.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "payments",
          parentId: "checkout",
          label: "Payments",
          route: "/commerce/operations/checkout/payments",
          icon: "commerce",
          order: 586,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for payment transaction records once the payment backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "shipments",
          parentId: "checkout",
          label: "Shipments",
          route: "/commerce/operations/checkout/shipments",
          icon: "commerce",
          order: 587,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for shipment records once the shipping backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "returns",
          parentId: "checkout",
          label: "Returns",
          route: "/commerce/operations/checkout/returns",
          icon: "commerce",
          order: 588,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for return requests and return lines once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "refunds",
          parentId: "checkout",
          label: "Refunds",
          route: "/commerce/operations/checkout/refunds",
          icon: "commerce",
          order: 589,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for refund records once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "consignments",
          parentId: "checkout",
          label: "Consignments",
          route: "/commerce/operations/checkout/consignments",
          icon: "commerce",
          order: 590,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for consignment and fulfillment split records once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "delivery-modes",
          parentId: "checkout",
          label: "Delivery Modes",
          route: "/commerce/operations/checkout/delivery-modes",
          icon: "commerce",
          order: 591,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for delivery-mode records once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "payment-modes",
          parentId: "checkout",
          label: "Payment Modes",
          route: "/commerce/operations/checkout/payment-modes",
          icon: "commerce",
          order: 592,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for payment-mode records once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "tax-records",
          parentId: "checkout",
          label: "Tax Records",
          route: "/commerce/operations/checkout/tax-records",
          icon: "commerce",
          order: 593,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for tax calculation evidence once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fraud-checks",
          parentId: "checkout",
          label: "Fraud Checks",
          route: "/commerce/operations/checkout/fraud-checks",
          icon: "commerce",
          order: 594,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "DISABLED",
          help: {
            summary:
              "Planned workspace for fraud-check evidence once the backend model is introduced.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
      ],
    },
  },
};
