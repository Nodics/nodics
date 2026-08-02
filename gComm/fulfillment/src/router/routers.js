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
  },
};
