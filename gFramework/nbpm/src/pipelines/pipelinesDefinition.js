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
                success: 'validateresponse'
            },
            loadSearchService: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSearchService',
                success: 'loadSearchModel'
            },
            loadSearchModel: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.loadSearchService',
                success: 'validateresponse'
            },
            validateresponse: {
                type: 'function',
                handler: 'DefaultWorkflowProcessPreparePipelineService.validateresponse',
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
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierAssignedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierAssignedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierAssignedPipelineService.updateSearchItems',
                success: 'successEnd'
            }
        }
    },

    defaultWorkflowCarrierReleasedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModels'
            },
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasedPipelineService.prepareModels',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasedPipelineService.updateSearchItems',
                success: 'successEnd'
            }
        }
    },

    defaultWorkflowCarrierBlockedPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierBlockedPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModels'
            },
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierBlockedPipelineService.prepareModels',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierBlockedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierBlockedPipelineService.updateSearchItems',
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
                success: 'prepareModels'
            },
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierPausedPipelineService.prepareModels',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierPausedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierPausedPipelineService.updateSearchItems',
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
                success: 'prepareModels'
            },
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierResumedPipelineService.prepareModels',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierResumedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierResumedPipelineService.updateSearchItems',
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
                success: 'prepareModels'
            },
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatedPipelineService.prepareModels',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatedPipelineService.updateSearchItems',
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
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowErrorOccurredPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowErrorOccurredPipelineService.updateSearchItems',
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
                success: 'prepareModels'
            },
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformedPipelineService.prepareModels',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformedPipelineService.updateSearchItems',
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
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierProcessedPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierProcessedPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierProcessedPipelineService.updateSearchItems',
                success: 'successEnd'
            }
        }
    },

    defaultWorkflowCarrierFilledPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierFilledPipelineService.validateRequest',
                success: 'prepareProcess'
            },
            prepareProcess: {
                type: 'process',
                handler: 'defaultWorkflowProcessPreparePipeline',
                success: 'prepareModel'
            },
            prepareModels: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierFilledPipelineService.prepareModel',
                success: {
                    schemaOperation: 'updateSchemaItems',
                    searchOperation: 'updateSearchItems'
                }
            },
            updateSchemaItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierFilledPipelineService.updateSchemaItems',
                success: 'successEnd'
            },
            updateSearchItems: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierFilledPipelineService.updateSearchItems',
                success: 'successEnd'
            }
        }
    },

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

};