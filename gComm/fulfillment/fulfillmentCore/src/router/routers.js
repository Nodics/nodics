/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/router/routers
 * @description Declares secured Fulfillment-owned operational APIs for BackOffice clients.
 * @layer router
 * @owner fulfillment
 * @override Customer modules may add shipping operations while preserving Fulfillment as the delivery, carrier, shipment, tracking, and return evidence authority.
 */
module.exports = {
  fulfillment: {
    operationsLifecycle: {
      execute: {
        secured: true,
        accessGroups: ["userGroup"],
        permission: "fulfillment.backoffice.manage",
        authTokenTypes: ["access"],
        apiExposure: "shippingOperations",
        key: "/operations/lifecycle",
        method: "POST",
        controller: "DefaultFulfillmentOperationsLifecycleController",
        operation: "execute",
        help: {
          requestType: "secured",
          message:
            "Executes one Fulfillment-owned shipping lifecycle action without accepting or returning carrier secrets or raw provider payloads.",
          method: "POST",
          url: "http://host:port/nodics/fulfillment/v0/operations/lifecycle",
          body: {
            actionId: "validate-carrier-provider",
            identity: {
              carrierCode: "defaultCarrierProvider",
            },
            model: {
              carrierCode: "defaultCarrierProvider",
            },
          },
        },
        responses: {
          200: {
            description: "Safe Fulfillment lifecycle action result",
          },
        },
      },
    },
    cancellationIntent: {
      cancelQuantity: {
        secured: true,
        accessGroups: ["userGroup"],
        permissionConfig: "authSecurity.internalToken.routePermission",
        apiExposure: "moduleInternal",
        key: "/references/consignments/cancel-quantity",
        method: "POST",
        controller: "DefaultFulfillmentCancellationIntentController",
        operation: "cancel",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Idempotently cancelled exact unshipped consignment quantity" } },
      },
    },
    warehouseReturnOperations: {
      receive: { secured: true, accessGroups: ["userGroup"], permission: "fulfillment.return.warehouse.receive", authTokenTypes: ["access"], apiExposure: "shippingOperations", key: "/operations/returns/:returnCode/receive", method: "POST", controller: "DefaultWarehouseReturnOperationsController", operation: "receive", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Normalized Fulfillment-owned Return receipt evidence" } } },
      inspect: { secured: true, accessGroups: ["userGroup"], permission: "fulfillment.return.warehouse.inspect", authTokenTypes: ["access"], apiExposure: "shippingOperations", key: "/operations/returns/:returnCode/inspect", method: "POST", controller: "DefaultWarehouseReturnOperationsController", operation: "inspect", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Normalized Fulfillment-owned Return inspection evidence" } } },
      disposition: { secured: true, accessGroups: ["userGroup"], permission: "fulfillment.return.warehouse.disposition", authTokenTypes: ["access"], apiExposure: "shippingOperations", key: "/operations/returns/:returnCode/disposition", method: "POST", controller: "DefaultWarehouseReturnOperationsController", operation: "disposition", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Inventory-owned stock outcome with normalized Fulfillment closure evidence" } } },
    },
  },
};
