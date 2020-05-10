/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    modelSaveInitializerPipeline: {
        nodes: {
            triggerModelChangeEvent: {
                success: 'handleWorkflowProcess'
            },
            handleWorkflowProcess: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.handleWorkflowProcess',
                success: 'successEnd'
            }
        }
    },

    modelsRemoveInitializerPipeline: {
        nodes: {
            triggerModelChangeEvent: {
                success: 'handleWorkflowProcess'
            },
            handleWorkflowProcess: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.handleWorkflowProcess',
                success: 'handleDeepRemove'
            }
        }
    },

    defaultWorkflowProcessPreparePipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.validateRequest',
                success: 'checkOperation'
            },
            checkOperation: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.checkOperation',
                success: {
                    schemaOperation: 'loadSchemaService',
                    searchOperation: 'loadSearchService'
                }
            },
            loadSchemaService: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSchemaService',
                success: 'loadSchemaModel'
            },
            loadSchemaModel: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSchemaModel',
                success: 'successEnd'
            },
            loadSearchService: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSearchService',
                success: 'loadSearchModel'
            },
            loadSearchModel: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSearchService',
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
                success: 'prepareProcess'
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

    defaultWorkflowItemUpdatedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowItemUpdatedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowItemUpdatedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemUpdatedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemUpdatedPipelineService.updateSearchItem',
                success: 'successEnd'
            }
        }
    },

    defaultWorkflowItemPausedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowItemPausedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowItemPausedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemPausedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemPausedPipelineService.updateSearchItem',
                success: 'successEnd'
            }
        }
    },
    defaultWorkflowItemResumedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowItemResumedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowItemResumedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemResumedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemResumedPipelineService.updateSearchItem',
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
                success: 'prepareProcess'
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
                success: 'prepareProcess'
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
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformedPipelineService.updateSearchItem',
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
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowItemProcessedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemProcessedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowItemProcessedPipelineService.updateSearchItem',
                success: 'successEnd'
            }
        }
    },
};