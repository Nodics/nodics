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
                success: 'assignWorkflowCarrierPipeline'
            },
            assignWorkflowCarrierPipeline: {
                type: 'process',
                handler: 'assignWorkflowCarrierPipeline',
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
                success: 'loadCarrierItems'
            },
            loadCarrierItems: {
                type: 'process',
                handler: 'loadCarrierItemsPipeline',
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

    loadCarrierItemsPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLoadCarrierItemsPipelineService.validateRequest',
                success: 'loadCarrierItems'
            },
            loadCarrierItems: {
                type: 'function',
                handler: 'DefaultLoadCarrierItemsPipelineService.loadCarrierItems',
                success: 'loadItems'
            },
            loadItems: {
                type: 'function',
                handler: 'DefaultLoadCarrierItemsPipelineService.loadItems',
                success: 'createCarrierItems'
            },
            createCarrierItems: {
                type: 'function',
                handler: 'DefaultLoadCarrierItemsPipelineService.createCarrierItems',
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
                success: 'assignWorkflowCarrierPipeline'
            },
            assignWorkflowCarrierPipeline: {
                type: 'process',
                handler: 'assignWorkflowCarrierPipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultNextWorkflowActionPipelineService.handleSuccess'
            }
        }
    },

    assignWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.validateRequest',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.prepareResponse',
                success: 'updateSatatus'
            },
            updateSatatus: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.updateSatatus',
                success: 'updateWorkflowCarrier'
            },
            updateWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.updateWorkflowCarrier',
                success: 'applyPutInterceptors'
            },
            applyPutInterceptors: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.applyPutInterceptors',
                success: 'applyPutValidators'
            },
            applyPutValidators: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.applyPutValidators',
                success: 'saveActiveItem'
            },
            saveActiveItem: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.saveActiveItem',
                success: 'triggerAssignedEvent'
            },
            triggerAssignedEvent: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.triggerAssignedEvent',
                success: 'performAction'
            },
            performAction: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.performAction',
                success: 'successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultAssignWorkflowCarrierPipelineService.handleError'
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

    pauseWorkflowCarrierPipeline: {
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

    resumeWorkflowCarrierPipeline: {
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
    // ---------------------------------------------------------------------
    performWorkflowActionPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'validateOperation'
            },
            validateOperation: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.validateOperation',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.updateCarrier',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.prepareResponse',
                success: 'preActionInterceptors'
            },
            preActionInterceptors: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.preActionInterceptors',
                success: 'preActionValidators'
            },
            preActionValidators: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.preActionValidators',
                success: 'handleAutoAction'
            },
            handleAutoAction: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.handleAutoAction',
                success: {
                    executeActionHandler: 'executeActionHandler',
                    executeActionScript: 'executeActionScript',
                    default: 'markActionExecuted'
                }
            },
            executeActionHandler: {
                type: 'process',
                handler: 'executeActionHandlerPipeline',
                success: 'markActionExecuted'
            },
            executeActionScript: {
                type: 'process',
                handler: 'executeActionScriptPipeline',
                success: 'markActionExecuted'
            },
            markActionExecuted: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.markActionExecuted',
                success: 'createStepResponse'
            },
            createStepResponse: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.createStepResponse',
                success: 'validateResponse'
            },
            validateResponse: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.validateResponse',
                success: 'updateActionResponse'
            },
            updateActionResponse: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.updateActionResponse',
                success: 'updateWorkflowCarrier'
            },
            updateWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.updateWorkflowCarrier',
                success: 'postActionValidators'
            },
            postActionValidators: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.postActionValidators',
                success: 'postActionInterceptors'
            },
            postActionInterceptors: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.postActionInterceptors',
                success: 'triggerActionPerformedEvent'
            },
            triggerActionPerformedEvent: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.triggerActionPerformedEvent',
                success: 'processChannels'
            },
            processChannels: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.processChannels',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.handleError'
            }
        }
    },
    executeActionHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExecuteActionHandlerPipelineService.validateRequest',
                success: 'executeHandler'
            },
            executeHandler: {
                type: 'function',
                handler: 'DefaultExecuteActionHandlerPipelineService.executeHandler',
                success: 'successEnd'
            }
        }
    },
    executeActionScriptPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExecuteActionScriptPipelineService.validateRequest',
                success: 'executeScript'
            },
            executeScript: {
                type: 'function',
                handler: 'DefaultExecuteActionScriptPipelineService.executeScript',
                success: 'successEnd'
            }
        }
    },
    evaluateChannelsPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'loadActionResponse'
            },
            loadActionResponse: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.loadActionResponse',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.prepareResponse',
                success: 'validateOperation'
            },
            validateOperation: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.validateOperation',
                success: 'evaluateChannels'
            },
            evaluateChannels: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.evaluateChannels',
                success: 'updateActionResponse'
            },
            updateActionResponse: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.updateActionResponse',
                success: 'executeChannels'
            },
            executeChannels: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.executeChannels',
                success: 'successEnd'
            }
        }
    },

    executeChannelQualifierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExecuteChannelQualifierPipelineService.validateRequest',
                success: 'checkDecision'
            },
            checkDecision: {
                type: 'function',
                handler: 'DefaultExecuteChannelQualifierPipelineService.checkDecision',
                success: 'executeHandler'
            },
            executeHandler: {
                type: 'function',
                handler: 'DefaultExecuteChannelQualifierPipelineService.executeHandler',
                success: 'executeScript'
            },
            executeScript: {
                type: 'function',
                handler: 'DefaultExecuteChannelQualifierPipelineService.executeScript',
                success: 'invalidChannel'
            },
            invalidChannel: {
                type: 'function',
                handler: 'DefaultExecuteChannelQualifierPipelineService.invalidChannel',
                success: 'successEnd'
            }
        }
    },

    executeChannelsPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.prepareResponse',
                success: 'loadActionResponse'
            },
            loadActionResponse: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.loadActionResponse',
                success: 'loadChannels'
            },
            loadChannels: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.loadChannels',
                success: 'validateChannels'
            },
            validateChannels: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.validateChannels',
                success: 'finalizeChannels'
            },
            finalizeChannels: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.finalizeChannels',
                success: 'handleMultiChannelRequest'
            },
            handleMultiChannelRequest: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.handleMultiChannelRequest',
                success: 'triggerItemSplitEvent'
            },
            triggerItemSplitEvent: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.triggerItemSplitEvent',
                success: 'triggerChannelExecution'
            },
            triggerChannelExecution: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.triggerChannelExecution',
                success: 'successEnd'
            }
        }
    },

    executeChannelPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.prepareResponse',
                success: 'loadActionResponse'
            },
            loadActionResponse: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.loadActionResponse',
                success: 'preChannelInterceptors'
            },
            preChannelInterceptors: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.preChannelInterceptors',
                success: 'preChannelValidators'
            },
            preChannelValidators: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.preChannelValidators',
                success: 'triggerTarget'
            },
            triggerTarget: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.triggerTarget',
                success: 'postChannelValidators'
            },
            postChannelValidators: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.postChannelValidators',
                success: 'postChannelInterceptors'
            },
            postChannelInterceptors: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.postChannelInterceptors',
                success: 'successEnd'
            }
        }
    },

    // ---------------------------------------------------------------------
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