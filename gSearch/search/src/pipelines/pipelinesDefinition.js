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
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoCheckClusterHealthInitializerService.buildOptions',
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
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoExistModelInitializerService.buildOptions',
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
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultDoGetModelsInitializerService.populateSubModels',
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
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultDoSearchModelsInitializerService.populateSubModels',
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
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.buildOptions',
                success: 'lookupCache'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.lookupCache',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.executeQuery',
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.populateSubModels',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.applyPostInterceptors',
                success: 'updateCache'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultDoSaveModelsInitializerService.updateCache',
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
                success: 'lookupCache'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.lookupCache',
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
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.populateSubModels',
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
                success: 'updateCache'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultDoRemoveModelsInitializerService.updateCache',
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

    doGetMappingModelInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoGetMappingInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoGetMappingInitializerService.buildOptions',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoGetMappingInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoGetMappingInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoGetMappingInitializerService.applyPostInterceptors',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoGetMappingInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoGetMappingInitializerService.handleErrorEnd'
            }
        }
    },

    doUpdateMappingModelInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDoUpdateMappingInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultDoUpdateMappingInitializerService.buildOptions',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultDoUpdateMappingInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultDoUpdateMappingInitializerService.executeQuery',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultDoUpdateMappingInitializerService.applyPostInterceptors',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDoUpdateMappingInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDoUpdateMappingInitializerService.handleErrorEnd'
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

    internalIndexerInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.validateRequest',
                success: 'changeIndexerState'
            },
            changeIndexerState: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.changeIndexerState',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.buildOptions',
                success: 'triggerIndex'
            },
            triggerIndex: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.triggerIndex',
                success: {
                    handleSuccess: 'successHandler',
                    handleError: 'errorHandler'
                }
            },
            successHandler: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.successHandler',
                success: 'successEnd'
            },
            errorHandler: {
                type: 'function',
                handler: 'DefaultInternalIndexerInitializerService.errorHandler',
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

    internalIndexerProcessPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.validateRequest',
                success: 'prepareHeader'
            },
            prepareHeader: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.prepareHeader',
                success: 'prepareOutputPath'
            },
            prepareOutputPath: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.prepareOutputPath',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.flushOutputFolder',
                success: 'initFatchData'
            },
            initFatchData: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.initFatchData',
                success: 'importDumpData'
            },
            importDumpData: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.importDumpData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInternalIndexerProcessService.handleErrorEnd'
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
    },

    externalIndexerInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.validateRequest',
                success: 'changeIndexerState'
            },
            changeIndexerState: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.changeIndexerState',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.buildOptions',
                success: 'buildQuery'
            },
            buildQuery: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.buildQuery',
                success: 'triggerIndex'
            },
            triggerIndex: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.triggerIndex',
                success: {
                    handleSuccess: 'successHandler',
                    handleError: 'errorHandler'
                }
            },
            successHandler: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.successHandler',
                success: 'successEnd'
            },
            errorHandler: {
                type: 'function',
                handler: 'DefaultExternalIndexerInitializerService.errorHandler',
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

    // indexerSuccessInitializerPipeline: {
    //     startNode: "validateRequest",
    //     hardStop: true, //default value is false
    //     handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

    //     nodes: {
    //         changeIndexerState: {
    //             type: 'function',
    //             handler: 'DefaultExternalIndexerInitializerService.changeIndexerState',
    //             success: 'successEnd'
    //         }
    //     }
    // },

    // indexerFailureInitializerPipeline: {
    //     startNode: "validateRequest",
    //     hardStop: true, //default value is false
    //     handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

    //     nodes: {
    //         changeIndexerState: {
    //             type: 'function',
    //             handler: 'DefaultExternalIndexerInitializerService.changeIndexerState',
    //             success: 'successEnd'
    //         }
    //     }
    // }
};