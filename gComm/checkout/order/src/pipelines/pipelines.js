/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/pipelines/pipelines
 * @description Pipeline definitions for atomic Order technical tasks.
 * @layer pipeline
 * @owner order
 * @override Project modules may override pipeline nodes, handlers, or flow order to add customer-specific order lifecycle behavior.
 */
module.exports = {
  orderValidationPipeline: {
    startNode: "validateOrderContext",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateOrderContext: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.validateOrderContext",
        success: "validateEntries",
      },
      validateEntries: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.validateEntries",
        success: "validateAllocations",
      },
      validateAllocations: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.validateAllocations",
        success: "validatePaymentEvidence",
      },
      validatePaymentEvidence: {
        type: "function",
        handler:
          "DefaultOrderCalculationPipelineService.validatePaymentEvidence",
        success: "validateHistoricalEvidence",
      },
      validateHistoricalEvidence: {
        type: "function",
        handler:
          "DefaultOrderCalculationPipelineService.validateHistoricalEvidence",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.handleErrorEnd",
      },
    },
  },
  orderEntryCalculationPipeline: {
    startNode: "resolveOrderEntryContext",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      resolveOrderEntryContext: {
        type: "function",
        handler:
          "DefaultOrderEntryCalculationPipelineService.resolveOrderEntryContext",
        success: "reconcileEntryPriceEvidence",
      },
      reconcileEntryPriceEvidence: {
        type: "function",
        handler:
          "DefaultOrderEntryCalculationPipelineService.reconcileEntryPriceEvidence",
        success: "reconcileEntryPromotions",
      },
      reconcileEntryPromotions: {
        type: "function",
        handler:
          "DefaultOrderEntryCalculationPipelineService.reconcileEntryPromotions",
        success: "reconcileEntryTax",
      },
      reconcileEntryTax: {
        type: "function",
        handler:
          "DefaultOrderEntryCalculationPipelineService.reconcileEntryTax",
        success: "reconcileInventoryEvidence",
      },
      reconcileInventoryEvidence: {
        type: "function",
        handler:
          "DefaultOrderEntryCalculationPipelineService.reconcileInventoryEvidence",
        success: "prepareOrderEntryTotals",
      },
      prepareOrderEntryTotals: {
        type: "function",
        handler:
          "DefaultOrderEntryCalculationPipelineService.prepareOrderEntryTotals",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultOrderEntryCalculationPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultOrderEntryCalculationPipelineService.handleErrorEnd",
      },
    },
  },
  orderCalculationPipeline: {
    startNode: "validateOrder",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateOrder: {
        type: "process",
        handler: "orderValidationPipeline",
        success: "calculateEntries",
      },
      calculateEntries: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.calculateEntries",
        childPipeline: "orderEntryCalculationPipeline",
        success: "reconcileDeliveryCharges",
      },
      reconcileDeliveryCharges: {
        type: "function",
        handler:
          "DefaultOrderCalculationPipelineService.reconcileDeliveryCharges",
        success: "reconcileOrderPromotions",
      },
      reconcileOrderPromotions: {
        type: "function",
        handler:
          "DefaultOrderCalculationPipelineService.reconcileOrderPromotions",
        success: "reconcileOrderTax",
      },
      reconcileOrderTax: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.reconcileOrderTax",
        success: "reconcilePaymentEvidence",
      },
      reconcilePaymentEvidence: {
        type: "function",
        handler:
          "DefaultOrderCalculationPipelineService.reconcilePaymentEvidence",
        success: "prepareOrderTotals",
      },
      prepareOrderTotals: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.prepareOrderTotals",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultOrderCalculationPipelineService.handleErrorEnd",
      },
    },
  },
  orderCancellationEligibilityPipeline: {
    startNode: "validateRequest",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateRequest: {
        type: "function",
        handler: "DefaultOrderCancellationEligibilityService.validateRequest",
        success: "resolveOwnerEvidence",
      },
      resolveOwnerEvidence: {
        type: "function",
        handler:
          "DefaultOrderCancellationEligibilityService.resolveOwnerEvidence",
        success: "evaluateItems",
      },
      evaluateItems: {
        type: "function",
        handler: "DefaultOrderCancellationEligibilityService.evaluateItems",
        success: "finalizeEligibility",
      },
      finalizeEligibility: {
        type: "function",
        handler:
          "DefaultOrderCancellationEligibilityService.finalizeEligibility",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultOrderCancellationEligibilityService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultOrderCancellationEligibilityService.handleErrorEnd",
      },
    },
  },
  orderCancellationCalculationPipeline: {
    startNode: "validateRequest",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateRequest: {
        type: "function",
        handler: "DefaultOrderCancellationCalculationService.validateRequest",
        success: "resolveOrderEvidence",
      },
      resolveOrderEvidence: {
        type: "function",
        handler: "DefaultOrderCancellationCalculationService.resolveOrderEvidence",
        success: "calculatePaymentAmount",
      },
      calculatePaymentAmount: {
        type: "function",
        handler: "DefaultOrderCancellationCalculationService.calculatePaymentAmount",
        success: "finalizeCalculation",
      },
      finalizeCalculation: {
        type: "function",
        handler: "DefaultOrderCancellationCalculationService.finalizeCalculation",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultOrderCancellationCalculationService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultOrderCancellationCalculationService.handleErrorEnd",
      },
    },
  },
  orderCancellationExecutionPipeline: {
    startNode: "validateExecution",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateExecution: { type: "function", handler: "DefaultOrderCancellationExecutionService.validateExecution", success: "cancelFulfillment" },
      cancelFulfillment: { type: "function", handler: "DefaultOrderCancellationExecutionService.cancelFulfillment", success: "cancelProductLifecycle" },
      cancelProductLifecycle: { type: "function", handler: "DefaultOrderCancellationExecutionService.cancelProductLifecycle", success: "cancelInventory" },
      cancelInventory: { type: "function", handler: "DefaultOrderCancellationExecutionService.cancelInventory", success: "reversePayment" },
      reversePayment: { type: "function", handler: "DefaultOrderCancellationExecutionService.reversePayment", success: "finalizeOrder" },
      finalizeOrder: { type: "function", handler: "DefaultOrderCancellationExecutionService.finalizeOrder", success: "successEnd" },
      successEnd: { type: "function", handler: "DefaultOrderCancellationExecutionService.handleSuccessEnd" },
      handleError: { type: "function", handler: "DefaultOrderCancellationExecutionService.handleErrorEnd" },
    },
  },
  returnRequestValidationPipeline: { startNode: "validateRequest", hardStop: true, handleError: "handleError", nodes: {
    validateRequest: { type: "function", handler: "DefaultOrderReturnValidationService.validateRequest", success: "resolveOwnerEvidence" },
    resolveOwnerEvidence: { type: "function", handler: "DefaultOrderReturnValidationService.resolveOwnerEvidence", success: "evaluateItems" },
    evaluateItems: { type: "function", handler: "DefaultOrderReturnValidationService.evaluateItems", success: "successEnd" },
    successEnd: { type: "function", handler: "DefaultOrderReturnValidationService.handleSuccessEnd" }, handleError: { type: "function", handler: "DefaultOrderReturnValidationService.handleErrorEnd" },
  } },
  returnAuthorizationPipeline: { startNode: "validateAuthorization", hardStop: true, handleError: "handleError", nodes: {
    validateAuthorization: { type: "function", handler: "DefaultOrderReturnAuthorizationService.validateAuthorization", success: "successEnd" },
    successEnd: { type: "function", handler: "DefaultOrderReturnAuthorizationService.handleSuccessEnd" }, handleError: { type: "function", handler: "DefaultOrderReturnAuthorizationService.handleErrorEnd" },
  } },
  refundCalculationPipeline: { startNode: "validateCalculation", hardStop: true, handleError: "handleError", nodes: {
    validateCalculation: { type: "function", handler: "DefaultOrderRefundCalculationService.validateCalculation", success: "calculateRefund" },
    calculateRefund: { type: "function", handler: "DefaultOrderRefundCalculationService.calculateRefund", success: "successEnd" },
    successEnd: { type: "function", handler: "DefaultOrderRefundCalculationService.handleSuccessEnd" }, handleError: { type: "function", handler: "DefaultOrderRefundCalculationService.handleErrorEnd" },
  } },
  refundApprovalPreparationPipeline: { startNode: "prepareApproval", hardStop: true, handleError: "handleError", nodes: {
    prepareApproval: { type: "function", handler: "DefaultOrderRefundApprovalService.prepareApproval", success: "successEnd" },
    successEnd: { type: "function", handler: "DefaultOrderRefundApprovalService.handleSuccessEnd" }, handleError: { type: "function", handler: "DefaultOrderRefundApprovalService.handleErrorEnd" },
  } },
  refundExecutionPipeline: { startNode: "validateExecution", hardStop: true, handleError: "handleError", nodes: {
    validateExecution: { type: "function", handler: "DefaultOrderRefundExecutionService.validateExecution", success: "executeProductLifecycleActions" },
    executeProductLifecycleActions: { type: "function", handler: "DefaultOrderRefundExecutionService.executeProductLifecycleActions", success: "executePaymentRefund" },
    executePaymentRefund: { type: "function", handler: "DefaultOrderRefundExecutionService.executePaymentRefund", success: "successEnd" },
    successEnd: { type: "function", handler: "DefaultOrderRefundExecutionService.handleSuccessEnd" }, handleError: { type: "function", handler: "DefaultOrderRefundExecutionService.handleErrorEnd" },
  } },
  checkoutPlacementRunPipeline: {
    startNode: "validateRequest",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateRequest: {
        type: "function",
        handler: "DefaultCheckoutPlacementPipelineService.validateRequest",
        success: "startPlacementRun",
      },
      startPlacementRun: {
        type: "function",
        handler: "DefaultCheckoutPlacementPipelineService.startPlacementRun",
        success: "finalizePlacementRun",
      },
      finalizePlacementRun: {
        type: "function",
        handler: "DefaultCheckoutPlacementPipelineService.finalizePlacementRun",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultCheckoutPlacementPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultCheckoutPlacementPipelineService.handleErrorEnd",
      },
    },
  },
  createOrderPipeline: {
    startNode: "validateRequest",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateRequest: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.validateRequest",
        success: "validateMandateValues",
      },
      validateMandateValues: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.validateMandateValues",
        success: "validateItems",
      },
      validateItems: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.validateItems",
        success: "validateConsignments",
      },
      validateConsignments: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.validateConsignments",
        success: "validatePayments",
      },
      validatePayments: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.validatePayments",
        success: "validateOrder",
      },
      validateOrder: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.validateOrder",
        success: "saveOrder",
      },
      saveOrder: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.saveOrder",
        success: "postValidation",
      },
      postValidation: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.postValidation",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultCreateOrderPipelineService.handleErrorEnd",
      },
    },
  },
};
