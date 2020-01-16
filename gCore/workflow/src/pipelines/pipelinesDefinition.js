/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    assignWorkflowItemPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.validateRequest',
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.loadWorkflowItem',
                success: {
                    loadInternalItem: 'handleInternalItem',
                    loadExternalItem: 'handleExternalItem',
                    default: 'loadWorkflowHead'
                }
            },
            handleInternalItem: {
                type: 'process',
                handler: 'handleInternalItemCreatePipeline',
                success: 'loadWorkflowHead'
            },
            handleExternalItem: {
                type: 'process',
                handler: 'handleExternalItemCreatePipeline',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.loadWorkflowHead',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.loadWorkflow',
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
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultAssignWorkflowItemPipelineService.handleErrorEnd'
            }
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
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'function',
                handler: 'DefaultInternalItemCreatePipelineService.loadWorkflowItem',
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
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'function',
                handler: 'DefaultExternalItemCreatePipelineService.loadWorkflowItem',
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
                handler: 'DefaultWorkflowActionExecutionPipelineService.validateRequest',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.loadWorkflowHead',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.loadWorkflowAction',
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.loadWorkflowItem',
                success: 'validateOperation'
            },
            validateOperation: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.validateOperation',
                success: 'preActionInterceptors'
            },
            preActionInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.preActionInterceptors',
                success: 'preActionValidators'
            },
            preActionValidators: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.preActionValidators',
                success: 'handleAutoAction'
            },
            handleAutoAction: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.handleAutoAction',
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
                handler: 'DefaultWorkflowActionExecutionPipelineService.createStepResponse',
                success: 'evaluateChannels'
            },
            evaluateChannels: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.evaluateChannels',
                success: 'updateStepResponse'
            },
            updateStepResponse: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.updateStepResponse',
                success: 'postActionInterceptors'
            },
            postActionInterceptors: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.postActionInterceptors',
                success: 'postActionValidators'
            },
            postActionValidators: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.postActionValidators',
                success: 'executeChannel'
            },
            executeChannel: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.executeChannel',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultWorkflowActionExecutionPipelineService.handleErrorEnd'
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
                handler: 'DefaultChannelEvolutionPipelineService.validateRequest',
                success: 'checkDecision'
            },
            checkDecision: {
                type: 'function',
                handler: 'DefaultChannelEvolutionPipelineService.checkDecision',
                success: 'executeHandler'
            },
            executeHandler: {
                type: 'function',
                handler: 'DefaultChannelEvolutionPipelineService.executeHandler',
                success: 'executeScript'
            },
            executeScript: {
                type: 'function',
                handler: 'DefaultChannelEvolutionPipelineService.executeScript',
                success: 'invalidChannel'
            },
            invalidChannel: {
                type: 'function',
                handler: 'DefaultChannelEvolutionPipelineService.invalidChannel',
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
                handler: 'DefaultChannelsExecutionPipelineService.validateRequest',
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'function',
                handler: 'DefaultChannelsExecutionPipelineService.loadWorkflowItem',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultChannelsExecutionPipelineService.loadWorkflowHead',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultChannelsExecutionPipelineService.loadWorkflowAction',
                success: 'handleMultiChannelRequest'
            },
            handleMultiChannelRequest: {
                type: 'function',
                handler: 'DefaultChannelsExecutionPipelineService.handleMultiChannelRequest',
                success: 'createChannelRequest'
            },
            createChannelRequest: {
                type: 'function',
                handler: 'DefaultChannelsExecutionPipelineService.createChannelRequest',
                success: 'triggerChannelExecution'
            },
            triggerChannelExecution: {
                type: 'function',
                handler: 'DefaultChannelsExecutionPipelineService.triggerChannelExecution',
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
                handler: 'DefaultChannelExecutionPipelineService.validateRequest',
                success: 'loadWorkflowItem'
            },
            preChannelInterceptors: {
                type: 'function',
                handler: 'DefaultChannelExecutionPipelineService.preChannelInterceptors',
                success: 'preChannelValidators'
            },
            preChannelValidators: {
                type: 'function',
                handler: 'DefaultChannelExecutionPipelineService.preChannelValidators',
                success: 'triggerTarget'
            },
            triggerTarget: {
                type: 'function',
                handler: 'DefaultChannelExecutionPipelineService.triggerTarget',
                success: 'postChannelInterceptors'
            },
            postChannelInterceptors: {
                type: 'function',
                handler: 'DefaultChannelExecutionPipelineService.postChannelInterceptors',
                success: 'postChannelValidators'
            },
            postChannelValidators: {
                type: 'function',
                handler: 'DefaultChannelExecutionPipelineService.postChannelValidators',
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
                success: 'executeScript'
            },
            executeErrorHandlers: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.executeScript',
                success: 'successEnd'
            },
            createErrorItem: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.executeScript',
                success: 'successEnd'
            },
            updateErrorPool: {
                type: 'function',
                handler: 'DefaultWorkflowErrorPipelineService.executeScript',
                success: 'successEnd'
            }
        }
    }
};