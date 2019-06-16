/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    modelsGetInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.validateRequest',
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
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.handleErrorEnd'
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
            },

            handleError: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.handleErrorEnd'
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
                success: 'buildQuery'
            },

            buildQuery: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.buildQuery',
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
                success: 'successEnd'
            },

            successEnd: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.handleErrorEnd'
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
                success: 'handleDeepRemove'
            },
            handleDeepRemove: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.handleDeepRemove',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultModelsRemoveInitializerService.handleErrorEnd'
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
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.applyPreInterceptors',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.buildQuery',
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
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultModelsUpdateInitializerService.handleErrorEnd'
            }
        }
    },
};