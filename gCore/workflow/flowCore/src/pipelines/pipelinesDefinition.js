/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    initWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.validateRequest',
                success: 'checkUpdateRequest'
            },
            checkUpdateRequest: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.checkUpdateRequest',
                success: {
                    carrierUpdate: 'carrierUpdateProcessPipeline',
                    carrierInit: 'prepareWorkflowProcessPipeline',
                    default: 'prepareWorkflowProcessPipeline'
                }
            },
            carrierUpdateProcessPipeline: {
                type: 'process',
                handler: 'carrierUpdateProcessPipeline',
                success: 'successEnd'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'assignWorkflowItemPipeline'
            },
            assignWorkflowItemPipeline: {
                type: 'process',
                handler: 'assignWorkflowItemPipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.handleSuccess'
            }
        }
    },

    carrierUpdateProcessPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.validateRequest',
                success: 'loadWorkflowAction'
            },
            createCarrierItem: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.createCarrierItem',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'process',
                handler: 'loadWorkflowActionPipeline',
                success: 'applyPreUpdateInterceptors'
            },
            applyPreUpdateInterceptors: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.applyPreUpdateInterceptors',
                success: 'applyPreUpdateValidators'
            },
            applyPreUpdateValidators: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.applyPreUpdateValidators',
                success: 'updateWorkflowCarrier'
            },
            updateWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.updateWorkflowCarrier',
                success: 'applyPostUpdateValidators'
            },
            applyPostUpdateValidators: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.applyPostUpdateValidators',
                success: 'applyPostUpdateInterceptors'
            },
            applyPostUpdateInterceptors: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.applyPostUpdateInterceptors',
                success: 'triggerItemUpdateEvent'
            },
            triggerItemUpdateEvent: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.triggerItemUpdateEvent',
                success: 'successEnd'
            }
        },
    },

    prepareWorkflowProcessPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.validateRequest',
                success: 'loadWorkflowCarrier'
            },
            loadWorkflowCarrier: {
                type: 'process',
                handler: 'loadWorkflowCarrierPipeline',
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'process',
                handler: 'loadWorkflowItemPipeline',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'process',
                handler: 'loadWorkflowActionPipeline',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.loadWorkflowHead',
                success: 'finalizeEventType'
            },
            finalizeEventType: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.finalizeEventType',
                success: 'successEnd'
            },
        }
    },

    loadWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLoadWorkflowCarrierPipelineService.validateRequest',
                success: 'loadWorkflowCarrier'
            },
            loadWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultLoadWorkflowCarrierPipelineService.loadWorkflowCarrier',
                success: 'createNewCarrier'
            },
            createNewCarrier: {
                type: 'function',
                handler: 'DefaultLoadWorkflowCarrierPipelineService.createNewCarrier',
                success: 'verifyWorkflowCarrier'
            },
            verifyWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultLoadWorkflowCarrierPipelineService.verifyWorkflowCarrier',
                success: 'successEnd'
            },
        }
    },

    loadWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLoadWorkflowItemsPipelineService.validateRequest',
                success: 'createWorkflowItems'
            },
            createWorkflowItems: {
                type: 'function',
                handler: 'DefaultLoadWorkflowItemsPipelineService.createWorkflowItems',
                success: 'successEnd'
            },
        }
    },

    loadWorkflowActionPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLoadWorkflowActionPipelineService.validateRequest',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultLoadWorkflowActionPipelineService.loadWorkflowAction',
                success: 'validateAction'
            },
            validateAction: {
                type: 'function',
                handler: 'DefaultLoadWorkflowActionPipelineService.validateAction',
                success: 'successEnd'
            }
        }
    },

    assignWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.validateRequest',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.prepareResponse',
                success: 'updateSatatus'
            },
            updateSatatus: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.updateSatatus',
                success: 'updateWorkflowCarrier'
            },
            updateWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.updateWorkflowCarrier',
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
                success: 'saveActiveItem'
            },
            saveActiveItem: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.saveActiveItem',
                success: 'triggerAssignedEvent'
            },
            triggerAssignedEvent: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.triggerAssignedEvent',
                success: 'performAction'
            },
            performAction: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.performAction',
                success: 'successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.handleError'
            }
        }
    },

    handleWorkflowSuccessPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.validateRequest',
                success: 'createSuccessItem'
            },
            createSuccessItem: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.createSuccessItem',
                success: 'updateArchivePool'
            },
            updateArchivePool: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.updateArchivePool',
                success: 'updateItemPool'
            },
            updateItemPool: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.updateItemPool',
                success: 'triggerSuccessEvent'
            },
            triggerSuccessEvent: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.triggerSuccessEvent',
                success: 'successEnd'
            }
        }
    },

    handleWorkflowErrorsPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.validateRequest',
                success: 'updateError'
            },
            updateError: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.updateError',
                success: {
                    createErrorItem: 'createErrorItem',
                    triggerErrorOccuredEvent: 'triggerErrorOccuredEvent'
                }
            },
            createErrorItem: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.createErrorItem',
                success: 'updateErrorPool'
            },
            updateErrorPool: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.updateErrorPool',
                success: 'updateItemPool'
            },
            updateItemPool: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.updateItemPool',
                success: 'triggerErrorOccuredEvent'
            },
            triggerErrorOccuredEvent: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.triggerErrorOccuredEvent',
                success: 'successEnd'
            }
        }
    },

    loadWorkflowChainPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLoadWorkflowChainPipelineService.validateRequest',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultLoadWorkflowChainPipelineService.buildQuery',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultLoadWorkflowChainPipelineService.loadWorkflowAction',
                success: 'checkAccess'
            },
            checkAccess: {
                type: 'function',
                handler: 'DefaultLoadWorkflowChainPipelineService.checkAccess',
                success: 'loadChannelDetail'
            },
            loadChannelDetail: {
                type: 'function',
                handler: 'DefaultLoadWorkflowChainPipelineService.loadChannelDetail',
                success: 'loadChannelsAction'
            },
            loadChannelsAction: {
                type: 'function',
                handler: 'DefaultLoadWorkflowChainPipelineService.loadChannelsAction',
                success: 'successEnd'
            }
        }
    },
};