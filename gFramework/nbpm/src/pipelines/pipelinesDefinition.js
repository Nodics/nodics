/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    defaultWorkflowProcessPreparePipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.validateRequest',
                success: 'loadSchemaModel'
            },
            checkOperation: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSchemaModel',
                success: {
                    schemaOperation: 'loadSchemaModel',
                    searchOperation: 'loadSearchModel'
                }
            },
            loadSchemaModel: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSchemaModel',
                success: 'successEnd'
            },
            loadSearchModel: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSearchModel',
                success: 'successEnd'
            },
        },
    },

    defaultWorkflowItemAssignedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowItemAssignedPipelineService.validateRequest',
                success: 'loadSchemaModel'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowItemAssignedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemAssignedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemAssignedPipelineService.updateSearchItem',
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
                handler: 'DefaultWorkflowErrorOccurredPipelineService.validateRequest',
                success: 'successEnd'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowErrorOccurredPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowErrorOccurredPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowErrorOccurredPipelineService.updateSearchItem',
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
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowChannelsEvaluatedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'prepareSchemaItem',
                    searchOperation: 'prepareSearchItem'
                }
            },
            prepareSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowChannelsEvaluatedPipelineService.prepareSchemaItem',
                success: 'updateSchemaItem'
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowChannelsEvaluatedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            prepareSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowChannelsEvaluatedPipelineService.prepareSearchItem',
                success: 'updateSearchItem'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowChannelsEvaluatedPipelineService.updateSearchItem',
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