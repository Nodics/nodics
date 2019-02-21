/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /*finalizeDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.validateRequest',
                success: 'redirectToImportType'
            },
            redirectToImportType: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.redirectToImportType',
                success: {
                    finalizeSystemData: 'finalizeSystemData',
                    finalizeLocalFileData: 'finalizeLocalFileData'
                }
            },
            finalizeSystemData: {
                type: 'process',
                handler: 'finalizeSystemInitializerPipeline',
                success: 'successEnd'
            },
            finalizeLocalFileData: {
                type: 'process',
                handler: 'finalizeLocalFileDataInitializerPipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.handleErrorEnd'
            }
        }
    },

    finalizeSystemInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultSystemDataFinalizerService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultSystemDataFinalizerService.executeDataProcessor',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultSystemDataFinalizerService.processData',
                success: 'writeDataFile'
            },
            writeDataFile: {
                type: 'function',
                handler: 'DefaultSystemDataFinalizerService.writeDataFile',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultSystemDataFinalizerService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultSystemDataFinalizerService.handleErrorEnd'
            }
        }
    },*/

    finalizeFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLocalFileDataFinalizerService.validateRequest',
                success: 'prepareFileType'
            },
            prepareFileType: {
                type: 'function',
                handler: 'DefaultLocalFileDataFinalizerService.prepareFileType',
                success: 'redirectToFileTypeProcess'
            },
            redirectToFileTypeProcess: {
                type: 'function',
                handler: 'DefaultLocalFileDataFinalizerService.redirectToFileTypeProcess',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultLocalFileDataFinalizerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultLocalFileDataFinalizerService.handleErrorEnd'
            }
        }
    },

    dataHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataHandlerProcessService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultDataHandlerProcessService.executeDataProcessor',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultDataHandlerProcessService.processData',
                success: 'writeDataFile'
            },
            writeDataFile: {
                type: 'function',
                handler: 'DefaultDataHandlerProcessService.writeDataFile',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataHandlerProcessService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultDataHandlerProcessService.handleErrorEnd'
            }
        }
    },

    /**
     * This Pipeline is used to filter all data, which needs to be finalize
     */
    defaultFinalizerDataFilterPipeline: {
        startNode: "processData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            processData: {
                type: 'function',
                handler: 'DefaultFinalizerDataProcessService.processData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultFinalizerDataProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultFinalizerDataProcessService.handleErrorEnd'
            }
        }
    },

    writeDataIntoFileInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultFileWriterService.validateRequest',
                success: 'generateDataKey'
            },
            generateDataKey: {
                type: 'function',
                handler: 'DefaultFileWriterService.generateDataKey',
                success: 'writeIntoFile'
            },
            writeIntoFile: {
                type: 'function',
                handler: 'DefaultFileWriterService.writeIntoFile',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultFileWriterService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultFileWriterService.handleErrorEnd'
            }
        }
    }
};