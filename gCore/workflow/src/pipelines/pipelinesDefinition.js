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
                type: 'process',
                handler: 'loadWorkflowItemPipeline',
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
                success: 'updateWorkflowItems'
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

    performWorkflowActionPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.validateRequest',
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'process',
                handler: 'loadWorkflowItemPipeline',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.loadWorkflowHead',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.loadWorkflowAction',
                success: 'validateOperation'
            },
            validateOperation: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.validateOperation',
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
                success: 'processChannels'
            },
            processChannels: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.processChannels',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultExecuteWorkflowActionPipelineService.handleErrorEnd'
            }
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
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'process',
                handler: 'loadWorkflowItemPipeline',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.loadWorkflowHead',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.loadWorkflow',
                success: 'loadActionResponse'
            },
            loadActionResponse: {
                type: 'function',
                handler: 'DefaultEvoluteChannelsPipelineService.loadActionResponse',
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
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'process',
                handler: 'loadWorkflowItemPipeline',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.loadWorkflowHead',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.loadWorkflow',
                success: 'loadActionResponse'
            },
            loadActionResponse: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.loadActionResponse',
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
                success: 'executeChannel'
            },
            executeChannel: {
                type: 'function',
                handler: 'DefaultExecuteChannelsPipelineService.executeChannel',
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
                success: 'loadWorkflowItem'
            },
            loadWorkflowItem: {
                type: 'process',
                handler: 'loadWorkflowItemPipeline',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.loadWorkflowHead',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultExecuteChannelPipelineService.loadWorkflow',
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