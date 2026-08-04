/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/router/routers
 * @description Reserved order route contribution for custom order APIs beyond generated schema routes.
 * @layer router
 * @owner order
 * @override Project modules may add, remove, or replace order routes through governed router hierarchy contributions.
 */
module.exports = {
  order: {
    cancellationCustomerIntent: {
      create: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["userGroup"],
        permission: "order.cancellation.customer.create",
        apiExposure: "orderCustomer",
        key: "/self/cancellations",
        method: "POST",
        controller: "DefaultOrderCancellationIntentController",
        operation: "createCustomer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["entCode", "orderCode", "idempotencyKey", "reasonCode", "items"],
                properties: {
                  entCode: { type: "string" }, orderCode: { type: "string" }, idempotencyKey: { type: "string" },
                  reasonCode: { type: "string" }, reasonNote: { type: "string" }, requestedOutcome: { type: "string" },
                  items: { type: "array", minItems: 1, items: { type: "object", additionalProperties: false,
                    required: ["orderEntryCode", "requestedQuantity"], properties: { orderEntryCode: { type: "string" },
                      requestedQuantity: { type: "string" }, serialNumbers: { type: "array", items: { type: "string" } } } } },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Submitted customer-owned cancellation request" } },
      },
      status: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.cancellation.customer.read", apiExposure: "orderCustomer", key: "/self/cancellations/:requestCode", method: "GET", controller: "DefaultOrderCancellationIntentController", operation: "statusCustomer", responses: { 200: { description: "Customer-owned cancellation request and item status" } } },
      cancelDraft: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.cancellation.customer.cancelDraft", apiExposure: "orderCustomer", key: "/self/cancellations/:requestCode/cancel-draft", method: "POST", controller: "DefaultOrderCancellationIntentController", operation: "cancelCustomerDraft", responses: { 200: { description: "Cancelled customer-owned draft request" } } },
      provideInformation: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.cancellation.customer.provideInformation", apiExposure: "orderCustomer", key: "/self/cancellations/:requestCode/information", method: "POST", controller: "DefaultOrderCancellationIntentController", operation: "informationCustomer", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Provided requested cancellation evidence" } } },
    },
    cancellationSupportIntent: {
      create: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.cancellation.support.create", apiExposure: "orderOperations", key: "/operations/cancellations", method: "POST", controller: "DefaultOrderCancellationIntentController", operation: "createSupport", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Submitted support-created cancellation request" } } },
      status: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.cancellation.support.read", apiExposure: "orderOperations", key: "/operations/cancellations/:requestCode", method: "GET", controller: "DefaultOrderCancellationIntentController", operation: "statusSupport", responses: { 200: { description: "Scoped support cancellation request and item status" } } },
      cancelDraft: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.cancellation.support.cancelDraft", apiExposure: "orderOperations", key: "/operations/cancellations/:requestCode/cancel-draft", method: "POST", controller: "DefaultOrderCancellationIntentController", operation: "cancelSupportDraft", responses: { 200: { description: "Cancelled scoped support-created draft request" } } },
      provideInformation: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.cancellation.support.provideInformation", apiExposure: "orderOperations", key: "/operations/cancellations/:requestCode/information", method: "POST", controller: "DefaultOrderCancellationIntentController", operation: "informationSupport", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Provided support cancellation evidence" } } },
    },
    returnCustomerIntent: {
      create: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.customer.create", apiExposure: "orderCustomer", key: "/self/returns", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "createCustomerReturn", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Submitted customer-owned Return request" } } },
      status: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.customer.read", apiExposure: "orderCustomer", key: "/self/returns/:requestCode", method: "GET", controller: "DefaultOrderLifecycleIntentController", operation: "statusCustomerReturn", responses: { 200: { description: "Customer-owned Return request status" } } },
      cancelDraft: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.customer.cancelDraft", apiExposure: "orderCustomer", key: "/self/returns/:requestCode/cancel-draft", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "cancelCustomerReturn", responses: { 200: { description: "Cancelled customer-owned Return draft" } } },
      provideInformation: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.customer.provideInformation", apiExposure: "orderCustomer", key: "/self/returns/:requestCode/information", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "informationCustomerReturn", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Provided requested Return evidence and resubmitted a new immutable version" } } },
    },
    returnSupportIntent: {
      create: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.support.create", apiExposure: "orderOperations", key: "/operations/returns", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "createSupportReturn", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Submitted support-created Return request" } } },
      status: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.support.read", apiExposure: "orderOperations", key: "/operations/returns/:requestCode", method: "GET", controller: "DefaultOrderLifecycleIntentController", operation: "statusSupportReturn", responses: { 200: { description: "Scoped support Return request status" } } },
      cancelDraft: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.support.cancelDraft", apiExposure: "orderOperations", key: "/operations/returns/:requestCode/cancel-draft", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "cancelSupportReturn", responses: { 200: { description: "Cancelled support Return draft" } } },
      provideInformation: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.return.support.provideInformation", apiExposure: "orderOperations", key: "/operations/returns/:requestCode/information", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "informationSupportReturn", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Provided support Return evidence" } } },
    },
    refundCustomerIntent: {
      create: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.customer.create", apiExposure: "orderCustomer", key: "/self/refunds", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "createCustomerRefund", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Submitted customer-owned Refund request" } } },
      status: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.customer.read", apiExposure: "orderCustomer", key: "/self/refunds/:requestCode", method: "GET", controller: "DefaultOrderLifecycleIntentController", operation: "statusCustomerRefund", responses: { 200: { description: "Customer-owned Refund request status" } } },
      cancelDraft: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.customer.cancelDraft", apiExposure: "orderCustomer", key: "/self/refunds/:requestCode/cancel-draft", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "cancelCustomerRefund", responses: { 200: { description: "Cancelled customer-owned Refund draft" } } },
      provideInformation: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.customer.provideInformation", apiExposure: "orderCustomer", key: "/self/refunds/:requestCode/information", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "informationCustomerRefund", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Provided requested Refund evidence and resubmitted a new immutable version" } } },
    },
    refundSupportIntent: {
      create: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.support.create", apiExposure: "orderOperations", key: "/operations/refunds", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "createSupportRefund", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Submitted support-created Refund request" } } },
      status: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.support.read", apiExposure: "orderOperations", key: "/operations/refunds/:requestCode", method: "GET", controller: "DefaultOrderLifecycleIntentController", operation: "statusSupportRefund", responses: { 200: { description: "Scoped support Refund request status" } } },
      cancelDraft: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.support.cancelDraft", apiExposure: "orderOperations", key: "/operations/refunds/:requestCode/cancel-draft", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "cancelSupportRefund", responses: { 200: { description: "Cancelled support Refund draft" } } },
      provideInformation: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.refund.support.provideInformation", apiExposure: "orderOperations", key: "/operations/refunds/:requestCode/information", method: "POST", controller: "DefaultOrderLifecycleIntentController", operation: "informationSupportRefund", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Provided support Refund evidence" } } },
    },
    lifecycleOperations: {
      diagnostics: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.lifecycle.operations.diagnostics", apiExposure: "orderOperations", key: "/operations/lifecycle/diagnostics", method: "GET", controller: "DefaultOrderLifecycleOperationsController", operation: "diagnostics", responses: { 200: { description: "Permission-filtered lifecycle workload metrics, SLA findings, and owner recovery guidance" } } },
      notificationResult: { secured: true, authTokenTypes: ["service"], accessGroups: ["serviceGroup"], permission: "order.lifecycle.notification.result", apiExposure: "internal", key: "/internal/lifecycle/notification-result", method: "POST", controller: "DefaultOrderLifecycleOperationsController", operation: "notificationResult", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Idempotent normalized Notification delivery-result audit correlation" } } },
      managePolicy: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.lifecycle.policy.manage", apiExposure: "orderOperations", key: "/operations/lifecycle/policies", method: "POST", controller: "DefaultOrderLifecycleOperationsController", operation: "managePolicy", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Optimistic maker-checker lifecycle policy operation" } } },
      manageReason: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.lifecycle.reason.manage", apiExposure: "orderOperations", key: "/operations/lifecycle/reasons", method: "POST", controller: "DefaultOrderLifecycleOperationsController", operation: "manageReason", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Optimistic maker-checker lifecycle reason operation" } } },
    },
    lifecycleSupportOperations: {
      recommend: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.lifecycle.support.recommend", apiExposure: "orderOperations", key: "/operations/lifecycle/:requestCode/recommend", method: "POST", controller: "DefaultOrderLifecycleSupportController", operation: "recommend", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Append-only scoped support recommendation evidence" } } },
      message: { secured: true, authTokenTypes: ["access"], accessGroups: ["userGroup"], permission: "order.lifecycle.support.message", apiExposure: "orderOperations", key: "/operations/lifecycle/:requestCode/message", method: "POST", controller: "DefaultOrderLifecycleSupportController", operation: "message", requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Configured customer Notification intent after durable audit" } } },
    },
    orderOperations: {
      calculateOrderByCode: {
        secured: true,
        accessGroups: ["userGroup"],
        key: "/code/:code/calculate",
        method: "POST",
        controller: "DefaultOrderController",
        operation: "calculateOrderByCode",
        help: {
          requestType: "secured",
          message: "authToken need to set within header",
          method: "POST",
          url: "http://host:port/nodics/order/code/:code/calculate",
          body: {
            lifecycleOperation:
              "Required order lifecycle operation such as AMENDMENT, RETURN, REFUND, ADJUSTMENT, or RECONCILIATION",
            orderEntries: "Optional preloaded order entries for calculation",
            orderDeliveryGroups: "Optional preloaded delivery groups",
            orderPaymentGroups: "Optional preloaded payment groups",
            orderDeliveryAllocations: "Optional preloaded delivery allocations",
            orderPaymentAllocations: "Optional preloaded payment allocations",
          },
        },
      },
    },
  },
};
