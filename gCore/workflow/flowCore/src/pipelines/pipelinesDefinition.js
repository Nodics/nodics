/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    // *************************** Preparing workflow to be executeded - Start ***********************
    prepareWorkflowPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.validateRequest',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.prepareResponse',
                success: 'loadWorkflowCarrier'
            },
            loadWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.loadWorkflowCarrier',
                success: 'loadWorkflowAction'
            },
            loadWorkflowAction: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.loadWorkflowAction',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.loadWorkflowHead',
                success: 'validateLoadedData'
            },
            validateLoadedData: {
                type: 'function',
                handler: 'DefaultWorkflowPreparePipelineService.validateLoadedData',
                success: 'successEnd'
            },
        }
    },
    // *************************** Preparing workflow to be executeded - End ***********************
    // *************************** Initializing workflow carrier - Start ***********************
    initWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.validateRequest',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.prepareResponse',
                success: 'buildWorkflowCarrier'
            },
            buildWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.buildWorkflowCarrier',
                success: 'validateWorkflowCarrier'
            },
            validateWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.validateWorkflowCarrier',
                success: 'loadWorkflowHead'
            },
            loadWorkflowHead: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.loadWorkflowHead',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.updateCarrier',
                success: 'saveActiveItem'
            },
            saveActiveItem: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.saveActiveItem',
                success: 'releaseWorkflow'
            },
            releaseWorkflow: {
                type: 'function',
                handler: 'DefaultInitWorkflowCarrierPipelineService.releaseWorkflow',
                success: 'successEnd'
            }
        }
    },
    // *************************** Initializing workflow carrier - End ***********************
    // *************************** Release workflow carrier - Start ***********************
    releaseWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.validateRequest',
                success: 'prepareWorkflowPipeline'
            },
            prepareWorkflowPipeline: {
                type: 'process',
                handler: 'prepareWorkflowPipeline',
                success: 'releaseCarrier'
            },
            releaseCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.releaseCarrier',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.updateCarrier',
                success: 'executeAction'
            },
            executeAction: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierReleasePipelineService.executeAction',
                success: 'successEnd'
            }
        }
    },
    // *************************** Release workflow carrier - End ***********************
    // *************************** Re-fill workflow carrier - Start ***********************
    updateWorkflowCarrierPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatePipelineService.validateRequest',
                success: 'prepareWorkflowPipeline'
            },
            prepareWorkflowPipeline: {
                type: 'process',
                handler: 'prepareWorkflowPipeline',
                success: 'checkValidRequest'
            },
            checkValidRequest: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatePipelineService.checkValidRequest',
                success: 'prepareUpdates'
            },
            prepareUpdates: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatePipelineService.prepareUpdates',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowCarrierUpdatePipelineService.updateCarrier',
                success: 'successEnd'
            }
        }
    },
    // *************************** Re-fill workflow carrier - End ***********************
    // *************************** Execute workflow action - Start ***********************
    performWorkflowActionPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.validateRequest',
                success: 'prepareWorkflowPipeline'
            },
            prepareWorkflowPipeline: {
                type: 'process',
                handler: 'prepareWorkflowPipeline',
                success: 'validateOperation'
            },
            validateOperation: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.validateOperation',
                success: 'preUpdateCarrier'
            },
            preUpdateCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.preUpdateCarrier',
                success: 'handleManualAction'
            },
            handleManualAction: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.handleManualAction',
                success: 'handleAutoAction'
            },
            handleAutoAction: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.handleAutoAction',
                success: {
                    executeActionHandler: 'executeActionHandler',
                    executeActionScript: 'executeActionScript',
                    default: 'createStepResponse'
                }
            },
            executeActionHandler: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.executeActionHandler',
                success: 'createStepResponse'
            },
            executeActionScript: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.executeActionScript',
                success: 'createStepResponse'
            },
            createStepResponse: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.createStepResponse',
                success: 'validateActionResponse'
            },
            validateActionResponse: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.validateActionResponse',
                success: 'updatePostCarrierState'
            },
            updatePostCarrierState: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.updatePostCarrierState',
                success: 'evaluateChannels'
            },
            evaluateChannels: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.evaluateChannels',
                success: 'updateActionResponse'
            },
            updateActionResponse: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.updateActionResponse',
                success: 'validateEndAction'
            },
            validateEndAction: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.validateEndAction',
                success: 'prepareChannelRequests'
            },
            prepareChannelRequests: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.prepareChannelRequests',
                success: 'updateWorkflowCarrier'
            },
            updateWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.updateWorkflowCarrier',
                success: 'executeChannels'
            },
            executeChannels: {
                type: 'function',
                handler: 'DefaultWorkflowActionPerformPipelineService.executeChannels',
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
    // *************************** Execute workflow action - End ***********************
    // *************************** Evaluate Workflow Channels - Start ***********************
    evaluateChannelsPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultEvaluateChannelsPipelineService.validateRequest',
                success: 'prepareWorkflowPipeline'
            },
            prepareWorkflowPipeline: {
                type: 'process',
                handler: 'prepareWorkflowPipeline',
                success: 'loadActionResponse'
            },
            loadActionResponse: {
                type: 'function',
                handler: 'DefaultEvaluateChannelsPipelineService.loadActionResponse',
                success: 'validateOperation'
            },
            validateOperation: {
                type: 'function',
                handler: 'DefaultEvaluateChannelsPipelineService.validateOperation',
                success: 'evaluateChannels'
            },
            evaluateChannels: {
                type: 'function',
                handler: 'DefaultEvaluateChannelsPipelineService.evaluateChannels',
                success: 'validateChannels'
            },
            validateChannels: {
                type: 'function',
                handler: 'DefaultEvaluateChannelsPipelineService.validateChannels',
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
    prepareChannelRequestsPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultPrepareChannelRequestsPipelineService.validateRequest',
                success: 'prepareResponse'
            },
            prepareResponse: {
                type: 'function',
                handler: 'DefaultPrepareChannelRequestsPipelineService.prepareResponse',
                success: 'finalizeChannels'
            },
            finalizeChannels: {
                type: 'function',
                handler: 'DefaultPrepareChannelRequestsPipelineService.finalizeChannels',
                success: 'prepareChannelsRequest'
            },
            prepareChannelsRequest: {
                type: 'function',
                handler: 'DefaultPrepareChannelRequestsPipelineService.prepareChannelsRequest',
                success: 'successEnd'
            }
        }
    },
    // *************************** Evaluate Workflow Channels - End ***********************

    nextWorkflowActionPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultNextWorkflowActionPipelineService.validateRequest',
                success: 'prepareWorkflowPipeline'
            },
            prepareWorkflowPipeline: {
                type: 'process',
                handler: 'prepareWorkflowPipeline',
                success: 'preUpdateCarrier'
            },
            preUpdateCarrier: {
                type: 'function',
                handler: 'DefaultNextWorkflowActionPipelineService.preUpdateCarrier',
                success: 'updateCarrier'
            },
            updateCarrier: {
                type: 'function',
                handler: 'DefaultNextWorkflowActionPipelineService.updateCarrier',
                success: 'executeNextAction'
            },
            executeNextAction: {
                type: 'function',
                handler: 'DefaultNextWorkflowActionPipelineService.executeNextAction',
                success: 'successEnd'
            }
        }
    },
}
