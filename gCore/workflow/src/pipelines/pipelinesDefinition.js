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
                    default: 'successEnd'
                }
            },
            handleInternalItem: {
                type: 'process',
                handler: 'handleInternalItemCreatePipeline',
                success: 'successEnd'
            },
            handleExternalItem: {
                type: 'process',
                handler: 'handleExternalItemCreatePipeline',
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
                success: 'handleSubWorkflowAction'
            },
            handleSubWorkflowAction: {
                type: 'function',
                handler: 'DefaultLoadWorkflowActionPipelineService.handleSubWorkflowAction',
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
                handler: 'DefaultInitWorkflowItemPipelineService.successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInitWorkflowItemPipelineService.handleError'
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
                handler: 'DefaultNextWorkflowActionPipelineService.successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultNextWorkflowActionPipelineService.handleError'
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
                success: 'performAction'
            },
            performAction: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.performAction',
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
                    default: 'createStepResponse'
                }
            },
            executeActionHandler: {
                type: 'process',
                handler: 'executeActionHandlerPipeline',
                success: 'createStepResponse'
            },
            executeActionScript: {
                type: 'process',
                handler: 'executeActionScriptPipeline',
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
                success: 'postActionInterceptors'
            },
            updateWorkflowItem: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.updateWorkflowItem',
                success: 'postActionInterceptors'
            },
            postActionInterceptors: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.postActionInterceptors',
                success: 'postActionValidators'
            },
            postActionValidators: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.postActionValidators',
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
                success: 'postActionInterceptors'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.handleError'
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
                success: 'loadWorkflowItem'
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
                success: 'validateOperation'
            },
            handleMultiChannelRequest: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.handleMultiChannelRequest',
                success: 'createChannelRequest'
            },
            createChannelRequest: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.createChannelRequest',
                success: 'triggerChannelExecution'
            },
            triggerChannelExecution: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.triggerChannelExecution',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.handleError'
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
                success: 'postChannelInterceptors'
            },
            postChannelInterceptors: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.postChannelInterceptors',
                success: 'postChannelValidators'
            },
            postChannelValidators: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.postChannelValidators',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.successEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.handleError'
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
                success: 'executeSuccessHandlers'
            },
            executeSuccessHandlers: {
                type: 'function',
                handler: 'DefaultWorkflowSuccessPipelineService.executeSuccessHandlers',
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
                success: 'executeErrorHandlers'
            },
            executeErrorHandlers: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.executeErrorHandlers',
                success: 'createErrorItem'
            },
            createErrorItem: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.createErrorItem',
                success: 'updateErrorPool'
            },
            updateErrorPool: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.updateErrorPool',
                success: 'successEnd'
            }
        }
    }
};