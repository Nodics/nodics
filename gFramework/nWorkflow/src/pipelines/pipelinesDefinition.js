/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    assignWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.validateRequest',
                success: 'loadWorkflow'
            },
            loadWorkflow: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.loadWorkflow',
                success: 'createActiveItem'
            },
            createActiveItem: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.createActiveItem',
                success: 'applyPutInterceptors'
            },
            applyPutInterceptors: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.applyPutInterceptors',
                success: 'applyPutValidators'
            },
            applyPutValidators: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.applyPutValidators',
                success: 'triggerStart'
            },
            saveActiveItem: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.saveActiveItem',
                success: 'triggerStart'
            },
            triggerStart: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.triggerStart',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.handleErrorEnd'
            }
        }
    },

    startWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.validateRequest',
                success: 'loadWorkflow'
            },
            loadWorkflow: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.loadWorkflow',
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.loadWorkflowItem',
                success: 'applyStartInterceptors'
            },
            applyStartInterceptors: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.applyStartInterceptors',
                success: 'applyStartValidators'
            },
            applyStartValidators: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.applyStartValidators',
                success: 'executeHandler'
            },
            executeHandler: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.executeHandler',
                success: 'evaluateChannels'
            },
            evaluateChannels: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.evaluateChannels',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.handleErrorEnd'
            }
        }
    },
};