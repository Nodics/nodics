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
                success: 'createCarrier'
            },
            createCarrier: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.createCarrier',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'process',
                handler: 'loadWorkflowActionPipeline',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowCarrierPipelineService.loadWorkflowHead',
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

    nextWorkflowActionPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultNextWorkflowActionPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
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
                handler: 'DefaultNextWorkflowActionPipelineService.handleSuccess'
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

    blockWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierBlockPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'blockCarrier'
            },
            blockCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.blockCarrier',
                success: 'preBlockInterceptors'
            },
            preBlockInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.preBlockInterceptors',
                success: 'preBlockValidators'
            },
            preBlockValidators: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.preBlockValidators',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.updateCarrier',
                success: 'postBlockValidators'
            },
            postBlockValidators: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.postBlockValidators',
                success: 'postBlockInterceptors'
            },
            postBlockInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.postBlockInterceptors',
                success: 'triggerBlockedEvent'
            },
            triggerBlockedEvent: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.triggerBlockedEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.handleSuccess'
            }
        }
    },

    releaseWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'releaseCarrier'
            },
            releaseCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.releaseCarrier',
                success: 'preReleaseInterceptors'
            },
            preReleaseInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.preReleaseInterceptors',
                success: 'preReleaseValidators'
            },
            preReleaseValidators: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.preReleaseValidators',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.updateCarrier',
                success: 'postReleaseValidators'
            },
            postReleaseValidators: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.postReleaseValidators',
                success: 'postReleaseInterceptors'
            },
            postReleaseInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.postReleaseInterceptors',
                success: 'triggerReleasedEvent'
            },
            triggerReleasedEvent: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.triggerReleasedEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.handleSuccess'
            }
        }
    },

    pauseWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'pauseCarrier'
            },
            pauseCarrier: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.pauseCarrier',
                success: 'prePauseInterceptors'
            },
            prePauseInterceptors: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.prePauseInterceptors',
                success: 'prePauseValidators'
            },
            prePauseValidators: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.prePauseValidators',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.updateCarrier',
                success: 'postPauseValidators'
            },
            postPauseValidators: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.postReleaseValidators',
                success: 'postPauseInterceptors'
            },
            postPauseInterceptors: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.postPauseInterceptors',
                success: 'triggerPausedEvent'
            },
            triggerPausedEvent: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.triggerPausedEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultPauseWorkflowCarrierPipelineService.handleSuccess'
            }
        }
    },

    resumeWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'resumeCarrier'
            },
            resumeCarrier: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.resumeCarrier',
                success: 'preResumeInterceptors'
            },
            preResumeInterceptors: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.preResumeInterceptors',
                success: 'preResumeValidators'
            },
            preResumeValidators: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.preResumeValidators',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.updateCarrier',
                success: 'postResumeValidators'
            },
            postResumeValidators: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.postResumeValidators',
                success: 'postResumeInterceptors'
            },
            postResumeInterceptors: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.postResumeInterceptors',
                success: 'triggerResumedEvent'
            },
            triggerResumedEvent: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.triggerResumedEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultResumeWorkflowCarrierPipelineService.handleSuccess'
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
                success: 'successInterceptors'
            },
            successInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.successInterceptors',
                success: 'successValidators'
            },
            successValidators: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.successValidators',
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
                success: 'successInterceptors'
            },
            successInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.successInterceptors',
                success: 'successValidators'
            },
            successValidators: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.successValidators',
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