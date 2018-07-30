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
                success: 'buildOptions',
                failure: 'failureEnd'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.buildOptions',
                success: 'lookupCache',
                failure: 'failureEnd'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.lookupCache',
                success: 'executeQuery',
                failure: 'failureEnd'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.executeQuery',
                success: 'populateSubModels',
                failure: 'failureEnd'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.populateSubModels',
                success: 'updateCache',
                failure: 'failureEnd'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.updateCache',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.handleSucessEnd'
            },
            failureEnd: {
                type: 'function',
                handler: 'DefaultModelsGetInitializerService.handleFailureEnd'
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
                success: 'preProcessor',
                failure: 'failureEnd'
            },
            preProcessor: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.preProcessor',
                success: 'processModels',
                failure: 'failureEnd'
            },
            processModels: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.processModels',
                success: 'postProcessor',
                failure: 'failureEnd'
            },

            postProcessor: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.postProcessor',
                success: 'successEnd',
                failure: 'failureEnd'
            },

            successEnd: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'DefaultModelsSaveInitializerService.handleFailureEnd'
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
                success: 'applyPreInterceptors',
                failure: 'failureEnd'
            },

            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyPreInterceptors',
                success: 'buildQuery',
                failure: 'failureEnd'
            },

            buildQuery: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.buildQuery',
                success: 'saveModel',
                failure: 'failureEnd'
            },

            saveModel: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.saveModel',
                success: 'applyPostInterceptors',
                failure: 'failureEnd'
            },

            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.applyPostInterceptors',
                success: 'invalidateCache',
                failure: 'failureEnd'
            },

            invalidateCache: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.invalidateCache',
                success: 'successEnd',
                failure: 'failureEnd'
            },

            successEnd: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.handleFailureEnd'
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

        }
    },

    modelsUpdateInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {

        }
    },
};