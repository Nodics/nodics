/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validateModelValuesPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelValuesValidatorPipelineService.validateRequest',
                success: 'validateMandateValues'
            },
            validateMandateValues: {
                type: 'function',
                handler: 'DefaultModelValuesValidatorPipelineService.validateRequest',
                success: 'validateDataType'
            },
            validateDataType: {
                type: 'function',
                handler: 'DefaultModelValuesValidatorPipelineService.validateRequest',
                success: 'successEnd'
            }
        }
    },

    modelQueryBuilderPipeline: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelQueryBuilderPipelineService.validateRequest',
                success: 'buildFromOriginalQuery'
            },
            buildFromOriginalQuery: {
                type: 'function',
                handler: 'DefaultModelQueryBuilderPipelineService.buildFromOriginalQuery',
                success: 'skipForCustomQuery'
            },
            skipForCustomQuery: {
                type: 'function',
                handler: 'DefaultModelQueryBuilderPipelineService.skipForCustomQuery',
                success: 'buildIdQuery'
            },
            buildIdQuery: {
                type: 'function',
                handler: 'DefaultModelQueryBuilderPipelineService.buildIdQuery',
                success: 'buildPrimeryQuery'
            },
            buildPrimeryQuery: {
                type: 'function',
                handler: 'DefaultModelQueryBuilderPipelineService.buildPrimeryQuery',
                success: 'successEnd'
            }
        }
    },

    modelsGetInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.validateRequest',
                success: 'checkAccess'
            },
            checkAccess: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.checkAccess',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.buildQuery',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.buildOptions',
                success: 'lookupCache'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.lookupCache',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.applyPreInterceptors',
                success: 'applyPreValidators'
            },
            applyPreValidators: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.applyPreValidators',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.executeQuery',
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.populateSubModels',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.populateVirtualProperties',
                success: 'applyPostValidators'
            },
            applyPostValidators: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.applyPostValidators',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.applyPostInterceptors',
                success: 'updateCache'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.updateCache',
                success: 'successEnd'
            }
        }
    },

    modelsSaveInitializerPipeline: {
        startNode: "validateInput",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateInput: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.validateInput',
                success: 'preProcessor'
            },
            preProcessor: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.preProcessor',
                success: 'processModels'
            },
            processModels: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.processModels',
                success: 'postProcessor'
            },
            postProcessor: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.postProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.handleSucessEnd'
            }
        }
    },

    modelSaveInitializerPipeline: {
        startNode: "validateModel",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateModel: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.validateModel',
                success: 'checkAccess'
            },
            checkAccess: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.checkAccess',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'process',
                handler: 'modelQueryBuilderPipeline',
                success: 'applyDefaultValues'
            },
            applyDefaultValues: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyDefaultValues',
                success: 'removeVirtualProperties'
            },
            removeVirtualProperties: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.removeVirtualProperties',
                success: 'handleNestedModelsSave'
            },
            handleNestedModelsSave: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.handleNestedModelsSave',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyPreInterceptors',
                success: 'applyPreValidators'
            },
            applyPreValidators: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyPreValidators',
                success: 'applyValidators'
            },
            applyValidators: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyValidators',
                success: 'saveModel'
            },
            saveModel: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.saveModel',
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.populateSubModels',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.populateVirtualProperties',
                success: 'applyPostValidators'
            },
            applyPostValidators: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyPostValidators',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyPostInterceptors',
                success: 'invalidateRouterCache'
            },
            invalidateRouterCache: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.invalidateRouterCache',
                success: 'invalidateItemCache'
            },
            invalidateItemCache: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.invalidateItemCache',
                success: 'triggerModelChangeEvent'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.triggerModelChangeEvent',
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
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.validateRequest',
                success: 'checkAccess'
            },
            checkAccess: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.checkAccess',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.buildQuery',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.applyPreInterceptors',
                success: 'applyPreValidators'
            },
            applyPreValidators: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.applyPreValidators',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.executeQuery',
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.populateSubModels',
                success: 'applyPostValidators'
            },
            applyPostValidators: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.applyPostValidators',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.applyPostInterceptors',
                success: 'invalidateRouterCache'
            },
            invalidateRouterCache: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.invalidateRouterCache',
                success: 'invalidateItemCache'
            },
            invalidateItemCache: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.invalidateItemCache',
                success: 'triggerModelChangeEvent'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.triggerModelChangeEvent',
                success: 'handleWorkflowProcess'
            },
            handleWorkflowProcess: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.handleWorkflowProcess',
                success: 'handleDeepRemove'
            },
            handleDeepRemove: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.handleDeepRemove',
                success: 'successEnd'
            }
        }
    },

    modelsUpdateInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.validateRequest',
                success: 'checkAccess'
            },
            checkAccess: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.checkAccess',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.buildQuery',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.applyPreInterceptors',
                success: 'applyPreValidators'
            },
            applyPreValidators: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.applyPreValidators',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.executeQuery',
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.populateSubModels',
                success: 'applyPostValidators'
            },
            applyPostValidators: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.applyPostValidators',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.applyPostInterceptors',
                success: 'invalidateRouterCache'
            },
            invalidateRouterCache: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.invalidateRouterCache',
                success: 'invalidateItemCache'
            },
            invalidateItemCache: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.invalidateItemCache',
                success: 'triggerModelChangeEvent'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.triggerModelChangeEvent',
                success: 'successEnd'
            }
        }
    }
};