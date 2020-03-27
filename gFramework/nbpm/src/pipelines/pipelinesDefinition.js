/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    defaultWorkflowItemAssignedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowItemAssignedPipelineService.validateRequest',
                success: 'successEnd'
            }
        }
    },
    defaultWorkflowErrorOccurredPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowErrorOccuredPipelineService.validateRequest',
                success: 'successEnd'
            }
        }
    },
    defaultWorkflowChannelsEvaluatedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowChannelsEvaluatedPipelineService.validateRequest',
                success: 'successEnd'
            }
        }
    },
    defaultWorkflowActionPerformedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformedPipelineService.validateRequest',
                success: 'successEnd'
            }
        }
    },
    defaultWorkflowItemProcessedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowItemProcessedPipelineService.validateRequest',
                success: 'successEnd'
            }
        }
    },
};