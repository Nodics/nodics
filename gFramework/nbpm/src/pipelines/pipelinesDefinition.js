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

    defaultWorkflowCarrierAssignedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierAssignedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierAssignedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierAssignedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierAssignedPipelineService.updateSearchItem',
                success: 'successEnd'
            }
        }
    },

    defaultWorkflowCarrierUpdatedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatedPipelineService.updateSearchItem',
                success: 'successEnd'
            }
        }
    },

    defaultWorkflowCarrierPausedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierPausedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierPausedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierPausedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierPausedPipelineService.updateSearchItem',
                success: 'successEnd'
            }
        }
    },
    defaultWorkflowCarrierResumedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierResumedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierResumedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierResumedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierResumedPipelineService.updateSearchItem',
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
    defaultWorkflowCarrierProcessedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierProcessedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModel: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierProcessedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItem',
                    searchOperation: 'updateSearchItem'
                }
            },
            updateSchemaItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierProcessedPipelineService.updateSchemaItem',
                success: 'successEnd'
            },
            updateSearchItem: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierProcessedPipelineService.updateSearchItem',
                success: 'successEnd'
            }
        }
    },
};