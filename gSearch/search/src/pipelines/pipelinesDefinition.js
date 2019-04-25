/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    doRefreshIndexInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.buildOptions',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.applyPostInterceptors',
                success: 'triggerModelChangeEvent'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.triggerModelChangeEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoRefreshInitializerService.handleErrorEnd'
            }
        }
    },

    doHealthCheckClusterInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoCheckClusterHealthInitializerService.validateRequest',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoCheckClusterHealthInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoCheckClusterHealthInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoCheckClusterHealthInitializerService.applyPostInterceptors',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoCheckClusterHealthInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoCheckClusterHealthInitializerService.handleErrorEnd'
            }
        }
    },

    doExistModelInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoExistModelInitializerService.validateRequest',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoExistModelInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoExistModelInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoExistModelInitializerService.applyPostInterceptors',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoExistModelInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoExistModelInitializerService.handleErrorEnd'
            }
        }
    },

    doGetModelsInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.buildOptions',
                success: 'lookupCache'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.lookupCache',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.executeQuery',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.applyPostInterceptors',
                success: 'updateCache'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.updateCache',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.handleErrorEnd'
            }
        }
    },

    doSearchModelInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.buildOptions',
                success: 'lookupCache'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.lookupCache',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.executeQuery',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.applyPostInterceptors',
                success: 'updateCache'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.updateCache',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.handleErrorEnd'
            }
        }
    },

    doSaveModelsInitializerPipeline: {
        startNode: "validateInput",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateInput: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.validateInput',
                success: 'preProcessor'
            },
            preProcessor: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.preProcessor',
                success: 'processModels'
            },
            processModels: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.processModels',
                success: 'postProcessor'
            },
            postProcessor: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.postProcessor',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.handleErrorEnd'
            }
        }
    },

    doSaveModelInitializerPipeline: {
        startNode: "validateModel",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateModel: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.validateModel',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.buildQuery',
                success: 'applyValueProviders'
            },
            applyValueProviders: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.applyValueProviders',
                success: 'applyDefaultValues'
            },
            applyDefaultValues: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.applyDefaultValues',
                success: 'removeVirtualProperties'
            },
            removeVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.removeVirtualProperties',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.applyPreInterceptors',
                success: 'doSaveModel'
            },
            doSaveModel: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.doSaveModel',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.applyPostInterceptors',
                success: 'invalidateRouterCache'
            },
            invalidateRouterCache: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.invalidateRouterCache',
                success: 'invalidateSearchCache'
            },
            invalidateSearchCache: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.invalidateSearchCache',
                success: 'triggerModelChangeEvent'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.triggerModelChangeEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoSaveModelInitializerService.handleErrorEnd'
            }
        }
    },

    doBulkModelInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.buildOptions',
                success: 'lookupCache'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.lookupCache',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.executeQuery',
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.populateSubModels',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.applyPostInterceptors',
                success: 'updateCache'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.updateCache',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoBulkModelsInitializerService.handleErrorEnd'
            }
        }
    },

    doRemoveModelsInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.buildOptions',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.executeQuery',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.applyPostInterceptors',
                success: 'invalidateRouterCache'
            },
            invalidateRouterCache: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.invalidateRouterCache',
                success: 'invalidateSearchCache'
            },
            invalidateSearchCache: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.invalidateSearchCache',
                success: 'triggerModelChangeEvent'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.triggerModelChangeEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.handleErrorEnd'
            }
        }
    },

    doRemoveModelsByQueryInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.buildOptions',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.executeQuery',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.applyPostInterceptors',
                success: 'invalidateRouterCache'
            },
            invalidateRouterCache: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.invalidateRouterCache',
                success: 'invalidateSearchCache'
            },
            invalidateSearchCache: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.invalidateSearchCache',
                success: 'triggerModelChangeEvent'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.triggerModelChangeEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsByQueryInitializerService.handleErrorEnd'
            }
        }
    },

    doGetSchemaModelInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoGetSchemaInitializerService.validateRequest',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoGetSchemaInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoGetSchemaInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoGetSchemaInitializerService.applyPostInterceptors',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoGetSchemaInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoGetSchemaInitializerService.handleErrorEnd'
            }
        }
    },

    doUpdateSchemaModelInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoUpdateSchemaInitializerService.validateRequest',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoUpdateSchemaInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoUpdateSchemaInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoUpdateSchemaInitializerService.applyPostInterceptors',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoUpdateSchemaInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoUpdateSchemaInitializerService.handleErrorEnd'
            }
        }
    },

    doRemoveIndexInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.buildOptions',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.applyPostInterceptors',
                success: 'invalidateRouterCache'
            },
            invalidateRouterCache: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.invalidateRouterCache',
                success: 'invalidateSearchCache'
            },
            invalidateSearchCache: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.invalidateSearchCache',
                success: 'successEnd'
            },
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.triggerModelChangeEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoRemoveIndexInitializerService.handleErrorEnd'
            }
        }
    },


    // Indexer pipelines 

    indexerInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.validateRequest',
                success: 'changeIndexerState'
            },
            changeIndexerState: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.changeIndexerState',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.buildOptions',
                success: 'triggerIndex'
            },
            triggerIndex: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.triggerIndex',
                success: {
                    internalIndexerInitializer: 'internalIndexerInitializerPipeline',
                    externalIndexerInitializer: 'externalIndexerInitializerPipeline'
                }
            },
            internalIndexerInitializerPipeline: {
                type: 'process',
                handler: 'internalIndexerInitializerPipeline',
                success: 'successHandler',
                error: 'errorHandler'

            },
            externalIndexerInitializerPipeline: {
                type: 'process',
                handler: 'externalIndexerInitializerPipeline',
                success: 'successHandler',
                error: 'errorHandler'
            },
            successHandler: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.successHandler',
                success: 'successEnd'
            },
            errorHandler: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.errorHandler',
                success: 'handleError'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultIndexerInitializerService.handleErrorEnd'
            }
        }
    },

    internalIndexerInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.validateRequest',
                success: 'prepareHeader'
            },
            prepareHeader: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.prepareHeader',
                success: 'prepareInputPath'
            },
            prepareInputPath: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.prepareInputPath',
                success: 'prepareOutputPath'
            },
            prepareOutputPath: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.prepareOutputPath',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.flushOutputFolder',
                success: 'initFatchData'
            },
            initFatchData: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.initFatchData',
                success: 'importDumpData'
            },
            importDumpData: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.importDumpData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.handleErrorEnd'
            }
        }
    },

    externalIndexerInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.validateRequest',
                success: 'prepareHeader'
            },
            prepareHeader: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.prepareHeader',
                success: 'prepareInputPath'
            },
            prepareInputPath: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.prepareInputPath',
                success: 'prepareOutputPath'
            },
            prepareOutputPath: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.prepareOutputPath',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.flushOutputFolder',
                success: 'loadDataFileList'
            },
            loadDataFileList: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.loadDataFileList',
                success: 'resolveFileType'
            },
            resolveFileType: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.resolveFileType',
                success: 'triggerProcess'
            },
            triggerProcess: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.triggerProcess',
                success: 'importDumpData'
            },
            importDumpData: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.importDumpData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.handleErrorEnd'
            }
        }
    },

    finalizeIndexerDataPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.validateRequest',
                success: 'handleValueProviders'
            },
            handleValueProviders: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.handleValueProviders',
                success: 'applyProcessors'
            },
            applyProcessors: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.applyProcessors',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.applyInterceptors',
                success: 'executeIndexerPipeline'
            },
            executeIndexerPipeline: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.executeIndexerPipeline',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.processData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultIndexerDataFinalizerService.handleErrorEnd'
            }
        }
    }
};