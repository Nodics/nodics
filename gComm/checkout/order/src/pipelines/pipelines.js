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
