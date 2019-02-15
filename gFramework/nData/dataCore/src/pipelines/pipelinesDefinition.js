/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    defaultDataFinalizerProcessPipeline: {
        startNode: "processData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            processData: {
                type: 'function',
                handler: 'DefaultDataFinalizerProcessService.processData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataFinalizerProcessService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultDataFinalizerProcessService.handleErrorEnd'
            }
        }
    },

    finalizeDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.validateRequest',
                success: 'prepareOutputURL'
            },
            prepareOutputURL: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.prepareOutputURL',
                success: 'redirectToImportType'
            },
            redirectToImportType: {
                type: 'function',
                handler: 'DefaultDataFinalizerService.redirectToImportType',
                success: {
                    finalizeLocalData: 'finalizeLocalData',
                    finalizeExternalFileData: 'finalizeExternalFileData',
                    finalizeExternalDirectData: 'finalizeExternalDirectData'
                }
            },
            finalizeLocalData: {
                type: 'process',
                handler: 'finalizeLocalInitializerPipeline',
                success: 'successEnd'
            },
            finalizeExternalFileData: {
                type: 'process',
                handler: 'finalizeExternalFileDataInitializerPipeline',
                success: 'successEnd'
            },
            finalizeExternalDirectData: {
                type: 'process',
                handler: 'finalizeExternalDirectDataInitializerPipeline',
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

    finalizeLocalInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultLocalDataFinalizerService.validateRequest',
                success: 'executeDataProcessor'
            },
            executeDataProcessor: {
                type: 'function',
                handler: 'DefaultLocalDataFinalizerService.executeDataProcessor',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultLocalDataFinalizerService.processData',
                success: 'writeDataFile'
            },
            writeDataFile: {
                type: 'function',
                handler: 'DefaultLocalDataFinalizerService.writeDataFile',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultLocalDataFinalizerService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultLocalDataFinalizerService.handleErrorEnd'
            }
        }
    },

    finalizeExternalFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExternalFileDataFinalizerService.validateRequest',
                success: 'prepareFileType'
            },
            prepareFileType: {
                type: 'function',
                handler: 'DefaultExternalFileDataFinalizerService.prepareFileType',
                success: 'redirectToFileTypeProcess'
            },
            redirectToFileTypeProcess: {
                type: 'function',
                handler: 'DefaultExternalFileDataFinalizerService.redirectToFileTypeProcess',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExternalFileDataFinalizerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultExternalFileDataFinalizerService.handleErrorEnd'
            }
        }
    },

    finalizeExternalDirectDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExternalDirectDataFinalizerService.validateRequest',
                success: 'generateDataKey'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultExternalDirectDataFinalizerService.handleSucessEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultExternalDirectDataFinalizerService.handleErrorEnd'
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
    },
};