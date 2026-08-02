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
    checkoutPlacementRunPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCheckoutPlacementPipelineService.validateRequest',
                success: 'startPlacementRun'
            },
            startPlacementRun: {
                type: 'function',
                handler: 'DefaultCheckoutPlacementPipelineService.startPlacementRun',
                success: 'finalizePlacementRun'
            },
            finalizePlacementRun: {
                type: 'function',
                handler: 'DefaultCheckoutPlacementPipelineService.finalizePlacementRun',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCheckoutPlacementPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCheckoutPlacementPipelineService.handleErrorEnd'
            }
        }
    },
    createOrderPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateMandateValues',
                success: 'validateItems'
            },
            validateItems: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateItems',
                success: 'validateConsignments'
            },
            validateConsignments: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateConsignments',
                success: 'validatePayments'
            },
            validatePayments: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validatePayments',
                success: 'validateOrder'
            },
            validateOrder: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.validateOrder',
                success: 'saveOrder'
            },
            saveOrder: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.saveOrder',
                success: 'postValidation'
            },
            postValidation: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.postValidation',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCreateOrderPipelineService.handleErrorEnd'
            }
        }
    }
};
