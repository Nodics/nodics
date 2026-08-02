/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/pipelines/pipelines
 * @description Pipeline definitions for cart validation and cart creation orchestration.
 * @layer pipeline
 * @owner cart
 * @override Project modules may override pipeline nodes, handlers, or flow order to add customer-specific cart validation and persistence behavior.
 */
module.exports = {
  cartValidationPipeline: {
    startNode: "validateCartContext",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateCartContext: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.validateCartContext",
        success: "validateEntries",
      },
      validateEntries: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.validateEntries",
        success: "validateAllocations",
      },
      validateAllocations: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.validateAllocations",
        success: "validateInventoryReadiness",
      },
      validateInventoryReadiness: {
        type: "function",
        handler:
          "DefaultCartCalculationPipelineService.validateInventoryReadiness",
        success: "validateMoneyEvidence",
      },
      validateMoneyEvidence: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.validateMoneyEvidence",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.handleErrorEnd",
      },
    },
  },
  cartEntryCalculationPipeline: {
    startNode: "resolveProductContext",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      resolveProductContext: {
        type: "function",
        handler:
          "DefaultCartEntryCalculationPipelineService.resolveProductContext",
        success: "resolveBasePrice",
      },
      resolveBasePrice: {
        type: "function",
        handler: "DefaultCartEntryCalculationPipelineService.resolveBasePrice",
        success: "evaluateEntryPromotions",
      },
      evaluateEntryPromotions: {
        type: "function",
        handler:
          "DefaultCartEntryCalculationPipelineService.evaluateEntryPromotions",
        success: "calculateEntryTax",
      },
      calculateEntryTax: {
        type: "function",
        handler: "DefaultCartEntryCalculationPipelineService.calculateEntryTax",
        success: "verifyInventoryPromise",
      },
      verifyInventoryPromise: {
        type: "function",
        handler:
          "DefaultCartEntryCalculationPipelineService.verifyInventoryPromise",
        success: "prepareEntryTotals",
      },
      prepareEntryTotals: {
        type: "function",
        handler:
          "DefaultCartEntryCalculationPipelineService.prepareEntryTotals",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultCartEntryCalculationPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultCartEntryCalculationPipelineService.handleErrorEnd",
      },
    },
  },
  cartCalculationPipeline: {
    startNode: "validateCart",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateCart: {
        type: "process",
        handler: "cartValidationPipeline",
        success: "calculateEntries",
      },
      calculateEntries: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.calculateEntries",
        childPipeline: "cartEntryCalculationPipeline",
        success: "calculateDeliveryCharges",
      },
      calculateDeliveryCharges: {
        type: "function",
        handler:
          "DefaultCartCalculationPipelineService.calculateDeliveryCharges",
        success: "evaluateCartPromotions",
      },
      evaluateCartPromotions: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.evaluateCartPromotions",
        success: "calculateCartTax",
      },
      calculateCartTax: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.calculateCartTax",
        success: "calculatePaymentPlan",
      },
      calculatePaymentPlan: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.calculatePaymentPlan",
        success: "prepareCartTotals",
      },
      prepareCartTotals: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.prepareCartTotals",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultCartCalculationPipelineService.handleErrorEnd",
      },
    },
  },

  cartValidatorPipeline: {
    startNode: "validateRequest",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateRequest: {
        type: "function",
        handler: "defaultValidateCartPipelineService.validateRequest",
        success: "validateMandateValues",
      },
      validateMandateValues: {
        type: "function",
        handler: "defaultValidateCartPipelineService.validateMandateValues",
        success: "validateItems",
      },
      validateItems: {
        type: "function",
        handler: "defaultValidateCartPipelineService.validateItems",
        success: "validateConsignments",
      },
      validateConsignments: {
        type: "function",
        handler: "defaultValidateCartPipelineService.validateConsignments",
        success: "validatePayments",
      },
      validatePayments: {
        type: "function",
        handler: "defaultValidateCartPipelineService.validatePayments",
        success: "validateCart",
      },
      validateCart: {
        type: "function",
        handler: "defaultValidateCartPipelineService.validateCart",
        success: "successEnd",
      },
    },
  },
  createCartPipeline: {
    startNode: "validateRequest",
    hardStop: true,
    handleError: "handleError",
    nodes: {
      validateRequest: {
        type: "function",
        handler: "DefaultCreateCartPipelineService.validateRequest",
        success: "validateCart",
      },
      validateCart: {
        type: "process",
        handler: "cartValidatorPipeline",
        success: "saveCart",
      },
      saveCart: {
        type: "function",
        handler: "DefaultCreateCartPipelineService.saveCart",
        success: "postValidation",
      },
      postValidation: {
        type: "function",
        handler: "DefaultCreateCartPipelineService.postValidation",
        success: "successEnd",
      },
      successEnd: {
        type: "function",
        handler: "DefaultCreateCartPipelineService.handleSucessEnd",
      },
      handleError: {
        type: "function",
        handler: "DefaultCreateCartPipelineService.handleErrorEnd",
      },
    },
  },
  // cartValidatorPipeline: {
  //     nodes: {
  //         validatePayments: {
  //             type: 'function',
  //             handler: 'defaultValidateCartPipelineService.validatePayments',
  //             success: 'prepareToken'
  //         },
  //         prepareToken: {
  //             type: 'function',
  //             handler: 'defaultValidateCartPipelineService.prepareToken',
  //             success: 'validateCart'
  //         },
  //         validateCart: {
  //             type: 'function',
  //             handler: 'defaultValidateCartPipelineService.validateCart',
  //             success: 'successEnd'
  //         }

  //     }
  // }
};
