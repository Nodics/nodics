/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module fulfillment/config/properties @description Layered fulfillment release policy and BackOffice metadata. @layer configuration @owner fulfillment */
module.exports = {
  fulfillment: {
    fulfillmentPolicy: {
      groupingStrategy: "DELIVERY_GROUP",
      modes: {
        STANDARD: {
          modeCode: "STANDARD",
          displayName: "Standard shipping",
          defaultCarrierCode: "defaultCarrierProvider",
          carrierRequired: true,
          labelRequired: false,
          allowedProviderTypes: ["CARRIER", "AGGREGATOR", "LOCAL_DELIVERY"],
        },
        EXPRESS: {
          modeCode: "EXPRESS",
          displayName: "Express shipping",
          defaultCarrierCode: "defaultCarrierProvider",
          carrierRequired: true,
          labelRequired: true,
          allowedProviderTypes: ["CARRIER", "AGGREGATOR"],
        },
        PICKUP: {
          modeCode: "PICKUP",
          displayName: "Pickup",
          defaultCarrierCode: "defaultPickupProvider",
          carrierRequired: true,
          labelRequired: false,
          allowedProviderTypes: ["PICKUP_NETWORK"],
        },
        LOCAL_DELIVERY: {
          modeCode: "LOCAL_DELIVERY",
          displayName: "Local delivery",
          defaultCarrierCode: "defaultLocalDeliveryProvider",
          carrierRequired: true,
          labelRequired: false,
          allowedProviderTypes: ["LOCAL_DELIVERY"],
        },
      },
      carrierProviders: {
        defaultCarrierProvider: {
          carrierCode: "defaultCarrierProvider",
          name: "Default carrier provider",
          providerType: "CARRIER",
          modeCodes: ["STANDARD", "EXPRESS"],
          supportedDeliveryModes: ["STANDARD", "EXPRESS"],
          supportsLabels: true,
          supportsTracking: true,
          adapterService: "DefaultCarrierLabelGatewayService",
          policyService: "DefaultFulfillmentCarrierPolicyService",
          status: "ACTIVE",
        },
        defaultPickupProvider: {
          carrierCode: "defaultPickupProvider",
          name: "Default pickup provider",
          providerType: "PICKUP_NETWORK",
          modeCodes: ["PICKUP"],
          supportedDeliveryModes: ["PICKUP"],
          supportsLabels: false,
          supportsTracking: false,
          adapterService: "DefaultCarrierLabelGatewayService",
          policyService: "DefaultFulfillmentCarrierPolicyService",
          status: "ACTIVE",
        },
        defaultLocalDeliveryProvider: {
          carrierCode: "defaultLocalDeliveryProvider",
          name: "Default local delivery provider",
          providerType: "LOCAL_DELIVERY",
          modeCodes: ["LOCAL_DELIVERY"],
          supportedDeliveryModes: ["LOCAL_DELIVERY"],
          supportsLabels: false,
          supportsTracking: true,
          adapterService: "DefaultCarrierLabelGatewayService",
          policyService: "DefaultFulfillmentCarrierPolicyService",
          status: "ACTIVE",
        },
      },
      carrierProviderStatuses: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      carrierProviderTypes: ["CARRIER", "AGGREGATOR", "PICKUP_NETWORK", "LOCAL_DELIVERY"],
      consignmentStatuses: ["RELEASED", "PICKING", "PACKED", "SHIPPED", "PARTIALLY_SHIPPED", "DELIVERED", "CANCELLED", "FAILED"],
      shipmentStatuses: ["CREATED", "LABELLED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "FAILED", "CANCELLED"],
      trackingEventTypes: ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "FAILED"],
      trackingEventStatuses: ["ACCEPTED", "IGNORED", "APPLIED", "FAILED"],
      returnTypes: ["CUSTOMER_RETURN", "FAILED_DELIVERY", "EXCHANGE", "REPAIR"],
      returnStatuses: ["REQUESTED", "APPROVED", "PICKUP_REQUESTED", "IN_TRANSIT", "RECEIVED", "INSPECTED", "CLOSED", "CANCELLED", "FAILED"],
      returnTransitions: {
        REQUESTED: ["APPROVED", "CANCELLED", "FAILED"],
        APPROVED: ["PICKUP_REQUESTED", "IN_TRANSIT", "RECEIVED", "CANCELLED", "FAILED"],
        PICKUP_REQUESTED: ["IN_TRANSIT", "RECEIVED", "CANCELLED", "FAILED"],
        IN_TRANSIT: ["RECEIVED", "FAILED"],
        RECEIVED: ["INSPECTED", "CLOSED"],
        INSPECTED: ["CLOSED", "FAILED"],
        CLOSED: [],
        CANCELLED: [],
        FAILED: [],
      },
      returnDisposition: {
        defaultDispositionCode: "INSPECT",
        supportedDispositionCodes: ["INSPECT", "RESTOCK", "REPAIR", "SCRAP", "QUARANTINE"],
        inventoryMovement: {
          enabled: true,
          ownerModule: "inventory",
          dispositionsRequiringMovement: ["RESTOCK", "REPAIR", "SCRAP"],
          movementTypeByDisposition: {
            RESTOCK: "RETURN",
            REPAIR: "RETURN",
            SCRAP: "DAMAGE",
          },
          reasonCodePrefix: "RETURN_DISPOSITION",
        },
      },
      returnRecovery: {
        enabled: true,
        reviewActions: ["REVIEW_RETURN", "CLOSE_OR_CANCEL_RETURN"],
        terminalStatuses: ["CLOSED", "CANCELLED", "FAILED"],
      },
      trackingEventShipmentStatusMap: {
        PICKED_UP: "IN_TRANSIT",
        IN_TRANSIT: "IN_TRANSIT",
        OUT_FOR_DELIVERY: "IN_TRANSIT",
        DELIVERED: "DELIVERED",
        EXCEPTION: "FAILED",
        FAILED: "FAILED",
      },
      warehouseTaskTypes: ["PICK", "PACK", "HANDOFF"],
      warehouseTaskStatuses: ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "FAILED"],
      warehouseTaskTransitions: {
        OPEN: ["IN_PROGRESS", "COMPLETED", "CANCELLED", "FAILED"],
        IN_PROGRESS: ["COMPLETED", "CANCELLED", "FAILED"],
        COMPLETED: [],
        CANCELLED: [],
        FAILED: [],
      },
      warehouseTaskPolicy: {
        defaultTaskTypes: ["PICK", "PACK", "HANDOFF"],
        requireCompletedTasksBeforeDispatch: false,
      },
      shipmentTransitions: {
        CREATED: ["LABELLED", "DISPATCHED", "CANCELLED", "FAILED"],
        LABELLED: ["DISPATCHED", "CANCELLED", "FAILED"],
        DISPATCHED: ["IN_TRANSIT", "DELIVERED", "FAILED"],
        IN_TRANSIT: ["DELIVERED", "FAILED"],
        DELIVERED: [],
        FAILED: [],
        CANCELLED: [],
      },
      defaultConsignmentStatus: "RELEASED",
      labelPolicy: {
        defaultLabelGatewayService: "DefaultCarrierLabelGatewayService",
        labelReferencePrefix: "carrierLabel",
      },
      trackingPolicy: {
        applyShipmentStatusFromTrackingEvents: true,
      },
      maximumAggregateRecords: 1000,
      failureMessageLimit: 240,
    },
  },
  backofficeCapabilities: {
    fulfillment: {
      enabled: true,
      capabilityId: "fulfillment-management",
      displayName: "Fulfillment",
      category: "commerce",
      icon: "shipment",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      requiredPermissions: ["fulfillment.backoffice.read"],
      navigation: [
        {
          id: "fulfillment",
          parentId: "commerce-operations",
          parentModuleName: "pricing",
          label: "Fulfillment",
          route: "/commerce/operations/fulfillment",
          icon: "shipment",
          order: 620,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentConsignment" },
          lifecycleActions: [
            {
              id: "review-fulfillment-exceptions",
              label: "Review exceptions",
              intent: "RECONCILE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Review failed consignments, shipment exceptions, and delayed warehouse tasks through Fulfillment governance.",
              targetStatuses: ["FAILED", "RELEASED"],
              featureState: "PREVIEW",
            },
          ],
          help: {
            summary:
              "Review fulfillment releases, consignments, shipments, and delivery execution evidence.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-consignments",
          parentId: "fulfillment",
          label: "Consignments",
          route: "/commerce/operations/fulfillment/consignments",
          icon: "shipment",
          order: 621,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentConsignment" },
          lifecycleActions: [
            {
              id: "release-consignment",
              label: "Release consignment",
              intent: "CREATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Release order delivery allocations into a Fulfillment-owned consignment.",
              featureState: "PREVIEW",
            },
            {
              id: "cancel-consignment",
              label: "Cancel consignment",
              intent: "CANCEL",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Cancel a consignment only through Fulfillment lifecycle checks and Inventory release policy.",
              targetStatuses: ["RELEASED", "PICKING", "PACKED"],
              featureState: "PREVIEW",
            },
          ],
          detailPanels: [
            {
              id: "consignment-shipments",
              label: "Shipments",
              target: { moduleName: "fulfillment", schemaName: "fulfillmentShipment" },
              relation: {
                sourceField: "consignmentCode",
                targetField: "consignmentCode",
                cardinality: "MANY",
              },
              summary:
                "Carrier and shipment tracking records attached to this consignment.",
            },
            {
              id: "consignment-warehouse-tasks",
              label: "Warehouse tasks",
              target: { moduleName: "fulfillment", schemaName: "fulfillmentWarehouseTask" },
              relation: {
                sourceField: "consignmentCode",
                targetField: "consignmentCode",
                cardinality: "MANY",
              },
              summary:
                "Pick, pack, and handoff tasks created for this consignment.",
            },
            {
              id: "consignment-tracking-events",
              label: "Tracking events",
              target: { moduleName: "fulfillment", schemaName: "fulfillmentTrackingEvent" },
              relation: {
                sourceField: "consignmentCode",
                targetField: "consignmentCode",
                cardinality: "MANY",
              },
              summary:
                "Safe normalized carrier tracking events recorded for this consignment.",
            },
          ],
          help: {
            summary:
              "Review fulfillment consignments created from order delivery groups and allocations.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-shipments",
          parentId: "fulfillment",
          label: "Shipments",
          route: "/commerce/operations/fulfillment/shipments",
          icon: "shipment",
          order: 622,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentShipment" },
          lifecycleActions: [
            {
              id: "request-label",
              label: "Request label",
              intent: "CREATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Request a carrier label through the configured Fulfillment provider adapter.",
              targetStatuses: ["CREATED"],
              featureState: "PREVIEW",
            },
            {
              id: "dispatch-shipment",
              label: "Dispatch shipment",
              intent: "UPDATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Move a labelled shipment into dispatch lifecycle after warehouse checks.",
              targetStatuses: ["LABELLED", "CREATED"],
              featureState: "PREVIEW",
            },
          ],
          help: {
            summary:
              "Review shipment and tracking evidence for fulfillment consignments.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-modes",
          parentId: "fulfillment",
          label: "Shipping modes",
          route: "/commerce/operations/fulfillment/modes",
          icon: "shipment",
          order: 623,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentMode" },
          lifecycleActions: [
            {
              id: "create-shipping-mode",
              label: "Create mode",
              intent: "CREATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Create an enterprise-scoped shipping mode through Fulfillment authority.",
              featureState: "PREVIEW",
            },
            {
              id: "retire-shipping-mode",
              label: "Retire mode",
              intent: "UPDATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Retire a shipping mode after dependency and active-delivery validation.",
              targetStatuses: ["ACTIVE"],
              featureState: "PREVIEW",
            },
          ],
          help: {
            summary:
              "Review business-facing shipping modes such as Standard, Express, Pickup, Local Delivery, or customer-specific modes.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-carrier-providers",
          parentId: "fulfillment",
          label: "Carrier providers",
          route: "/commerce/operations/fulfillment/carrier-providers",
          icon: "shipment",
          order: 624,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentCarrierProvider" },
          lifecycleActions: [
            {
              id: "create-carrier-provider",
              label: "Create provider",
              intent: "CREATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Register a safe carrier provider and adapter reference. Credentials remain outside Fulfillment records.",
              featureState: "PREVIEW",
            },
            {
              id: "suspend-carrier-provider",
              label: "Suspend provider",
              intent: "UPDATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Suspend a carrier provider through Fulfillment governance and active-shipment checks.",
              targetStatuses: ["ACTIVE"],
              featureState: "PREVIEW",
            },
          ],
          help: {
            summary:
              "Maintain safe carrier provider metadata and adapter references for fulfillment labels and tracking.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-warehouse-tasks",
          parentId: "fulfillment",
          label: "Warehouse tasks",
          route: "/commerce/operations/fulfillment/warehouse-tasks",
          icon: "warehouse",
          order: 625,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentWarehouseTask" },
          lifecycleActions: [
            {
              id: "complete-warehouse-task",
              label: "Complete task",
              intent: "UPDATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Complete pick, pack, or handoff task evidence before shipment dispatch.",
              targetStatuses: ["OPEN", "IN_PROGRESS"],
              featureState: "PREVIEW",
            },
          ],
          help: {
            summary:
              "Review warehouse pick, pack, and handoff task evidence for fulfillment consignments.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-tracking-events",
          parentId: "fulfillment",
          label: "Tracking events",
          route: "/commerce/operations/fulfillment/tracking-events",
          icon: "shipment",
          order: 626,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentTrackingEvent" },
          lifecycleActions: [
            {
              id: "reconcile-tracking",
              label: "Reconcile tracking",
              intent: "RECONCILE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Reconcile normalized carrier tracking events with shipment lifecycle evidence.",
              targetStatuses: ["ACCEPTED", "FAILED"],
              featureState: "PREVIEW",
            },
          ],
          help: {
            summary:
              "Review safe normalized carrier tracking events and shipment lifecycle projections.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-returns",
          parentId: "fulfillment",
          label: "Returns",
          route: "/commerce/operations/fulfillment/returns",
          icon: "return",
          order: 627,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentReturnRequest" },
          lifecycleActions: [
            {
              id: "approve-return",
              label: "Approve return",
              intent: "APPROVE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Approve a governed return request and create pickup or receipt follow-up evidence.",
              targetStatuses: ["REQUESTED"],
              featureState: "PREVIEW",
            },
            {
              id: "close-return",
              label: "Close return",
              intent: "UPDATE",
              permission: "fulfillment.backoffice.manage",
              summary:
                "Close a return after inspection and Inventory disposition evidence is complete.",
              targetStatuses: ["RECEIVED", "INSPECTED"],
              featureState: "PREVIEW",
            },
          ],
          help: {
            summary:
              "Review return request, pickup, received, and inspection evidence owned by Fulfillment.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
      ],
    },
  },
};
