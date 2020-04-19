/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    prepareWorkflowProcessPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.validateRequest',
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
                success: 'prepareEndPoint'
            },
            prepareEndPoint: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.prepareEndPoint',
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
                handler: 'DefaultLoadWorkflowItemPipelineService.validateRequest',
                success: 'loadItem'
            },
            loadItem: {
                type: 'function',
                handler: 'DefaultLoadWorkflowItemPipelineService.loadItem',
                success: 'redirectCreateItem'
            },
            redirectCreateItem: {
                type: 'function',
                handler: 'DefaultLoadWorkflowItemPipelineService.redirectCreateItem',
                success: {
                    loadInternalItem: 'handleInternalItem',
                    loadExternalItem: 'handleExternalItem',
                    default: 'verifyWorkflowItem'
                }
            },
            handleInternalItem: {
                type: 'process',
                handler: 'handleInternalItemCreatePipeline',
                success: 'verifyWorkflowItem'
            },
            handleExternalItem: {
                type: 'process',
                handler: 'handleExternalItemCreatePipeline',
                success: 'verifyWorkflowItem'
            },
            verifyWorkflowItem: {
                type: 'function',
                handler: 'DefaultLoadWorkflowItemPipelineService.verifyWorkflowItem',
                success: 'successEnd'
            },
        }
    },

    handleInternalItemCreatePipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInternalItemCreatePipelineService.validateRequest',
                success: 'createInternalItem'
            },
            createInternalItem: {
                type: 'function',
                handler: 'DefaultInternalItemCreatePipelineService.createInternalItem',
                success: 'successEnd'
            }
        }
    },

    handleExternalItemCreatePipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExternalItemCreatePipelineService.validateRequest',
                success: 'createExternalItem'
            },
            createExternalItem: {
                type: 'function',
                handler: 'DefaultExternalItemCreatePipelineService.createExternalItem',
                success: 'successEnd'
            }
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

    initWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInitWorkflowItemPipelineService.validateRequest',
                success: 'checkUpdateRequest'
            },
            checkUpdateRequest: {
                type: 'function',
                handler: 'DefaultInitWorkflowItemPipelineService.checkUpdateRequest',
                success: {
                    itemUpdate: 'itemUpdateProcessPipeline',
                    itemInit: 'prepareWorkflowProcessPipeline',
                    default: 'prepareWorkflowProcessPipeline'
                }
            },
            itemUpdateProcessPipeline: {
                type: 'process',
                handler: 'itemUpdateProcessPipeline',
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
                handler: 'DefaultInitWorkflowItemPipelineService.handleSuccess'
            }
        }
    },

    itemUpdateProcessPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.validateRequest',
                success: 'redirectCreateItem'
            },
            redirectCreateItem: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.redirectCreateItem',
                success: {
                    loadInternalItem: 'handleInternalItem',
                    loadExternalItem: 'handleExternalItem',
                    default: 'applyPreUpdateInterceptors'
                }
            },
            handleInternalItem: {
                type: 'process',
                handler: 'handleInternalItemCreatePipeline',
                success: 'applyPreUpdateInterceptors'
            },
            handleExternalItem: {
                type: 'process',
                handler: 'handleExternalItemCreatePipeline',
                success: 'applyPreUpdateInterceptors'
            },
            applyPreUpdateInterceptors: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.applyPreUpdateInterceptors',
                success: 'applyPreUpdateValidators'
            },
            applyPreUpdateValidators: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.applyPreUpdateValidators',
                success: 'updateWorkflowItem'
            },
            updateWorkflowItem: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.updateWorkflowItem',
                success: 'applyPostUpdateValidators'
            },
            applyPostUpdateValidators: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.applyPostUpdateValidators',
                success: 'applyPostUpdateInterceptors'
            },
            applyPostUpdateInterceptors: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.applyPostUpdateInterceptors',
                success: 'triggerItemUpdateEvent'
            },
            triggerItemUpdateEvent: {
                type: 'function',
                handler: 'DefaultUpdateWorkflowItemPipelineService.triggerItemUpdateEvent',
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
                success: 'updateWorkflowItem'
            },
            updateWorkflowItem: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.updateWorkflowItem',
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

    pauseWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.buildQuery',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.prepareResponse',
                success: 'prePauseInterceptors'
            },
            prePauseInterceptors: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.prePauseInterceptors',
                success: 'prePauseValidators'
            },
            prePauseValidators: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.prePauseValidators',
                success: 'updateWorkflowItems'
            },
            updateWorkflowItems: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.updateWorkflowItems',
                success: 'postPauseValidators'
            },
            postPauseValidators: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.postPauseValidators',
                success: 'postPauseInterceptors'
            },
            postPauseInterceptors: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.postPauseInterceptors',
                success: 'triggerPauseEvent'
            },
            triggerPauseEvent: {
                type: 'function',
                handler: 'DefaultPauseWorkflowItemPipelineService.triggerPauseEvent',
                success: 'successEnd'
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
                handler: 'DefaultResumeWorkflowItemPipelineService.validateRequest',
                success: 'prepareWorkflowProcessPipeline'
            },
            prepareWorkflowProcessPipeline: {
                type: 'process',
                handler: 'prepareWorkflowProcessPipeline',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.buildQuery',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.prepareResponse',
                success: 'preResumeInterceptors'
            },
            preResumeInterceptors: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.preResumeInterceptors',
                success: 'preResumeValidators'
            },
            preResumeValidators: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.preResumeValidators',
                success: 'updateWorkflowItems'
            },
            updateWorkflowItems: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.updateWorkflowItems',
                success: 'postResumeValidators'
            },
            postResumeValidators: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.postResumeValidators',
                success: 'postResumeInterceptors'
            },
            postResumeInterceptors: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.postResumeInterceptors',
                success: 'triggerPauseEvent'
            },
            triggerPauseEvent: {
                type: 'function',
                handler: 'DefaultResumeWorkflowItemPipelineService.triggerPauseEvent',
                success: 'successEnd'
            }
        }
    },

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
                success: 'updateWorkflowItem'
            },
            updateWorkflowItem: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.updateWorkflowItem',
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