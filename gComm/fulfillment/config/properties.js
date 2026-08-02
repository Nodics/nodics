/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module fulfillment/config/properties @description Layered fulfillment release policy and BackOffice metadata. @layer configuration @owner fulfillment */
module.exports = {
  fulfillment: {
    fulfillmentPolicy: {
      groupingStrategy: "DELIVERY_GROUP",
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
          help: {
            summary:
              "Review shipment and tracking evidence for fulfillment consignments.",
            documentationRoute: "/docs/capabilities/commerce/end-to-end",
          },
        },
        {
          id: "fulfillment-carrier-providers",
          parentId: "fulfillment",
          label: "Carrier providers",
          route: "/commerce/operations/fulfillment/carrier-providers",
          icon: "shipment",
          order: 623,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentCarrierProvider" },
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
          order: 624,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentWarehouseTask" },
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
          order: 625,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentTrackingEvent" },
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
          order: 626,
          group: { id: "commerce", label: "Commerce", order: 300 },
          perspectives: ["operations", "commerce"],
          contexts: ["environment", "tenant", "enterprise"],
          featureState: "PREVIEW",
          requiredPermissions: ["fulfillment.backoffice.read"],
          workbenchTarget: { moduleName: "fulfillment", schemaName: "fulfillmentReturnRequest" },
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
