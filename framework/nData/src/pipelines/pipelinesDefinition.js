/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    dataImportInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.validateRequest',
                success: 'redirectToImportType',
                failure: 'failureEnd'
            },
            redirectToImportType: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.redirectToImportType',
                success: {
                    fileImport: 'importFromFile',
                    directImport: 'importFromDirect'
                },
                failure: 'failureEnd'
            },
            importFromFile: {
                type: 'process',
                handler: 'fileDataImportInitializerPipeline',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            importFromDirect: {
                type: 'process',
                handler: 'directDataImportInitializerPipeline',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.handleErrorEnd'
            }
        }
    },

    directDataImportInitializerPipeline: {
        startNode: "placeholder",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            placeholder: {
                type: 'function',
                handler: 'DefaultDirectDataImportInitializerPipeline.placeholder',
                success: 'successEnd',
                failure: 'failureEnd'
            },
        }
    },

    fileDataImportInitializerPipeline: {
        startNode: "loadInternalHeaderFileList",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadInternalHeaderFileList: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.loadInternalHeaderFileList',
                success: 'loadInternalDataFileList',
                failure: 'failureEnd'
            },
            loadInternalDataFileList: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.loadInternalDataFileList',
                success: 'loadExternalHeaderFileList',
                failure: 'failureEnd'
            },
            loadExternalHeaderFileList: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.loadExternalHeaderFileList',
                success: 'loadExternalDataFileList',
                failure: 'failureEnd'
            },
            loadExternalDataFileList: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.loadExternalDataFileList',
                success: 'resolveFileType',
                failure: 'failureEnd'
            },

            resolveFileType: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.resolveFileType',
                success: 'buildHeaderInstances',
                failure: 'failureEnd'
            },
            buildHeaderInstances: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.buildHeaderInstances',
                success: 'assignDataFilesToHeader',
                failure: 'failureEnd'
            },
            assignDataFilesToHeader: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.assignDataFilesToHeader',
                success: 'processInternalDataHeaders',
                failure: 'failureEnd'
            },
            processInternalDataHeaders: {// Loop through all headers available for internal data
                type: 'function',       // Call headerProcessPipeline for each header
                handler: 'DefaultFileDataImportInitializerService.processInternalDataHeaders',
                success: 'processExternalDataHeaders',
                failure: 'failureEnd'
            },
            processExternalDataHeaders: {// Loop through all headers available for external data
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.processExternalDataHeaders',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    },

    headerProcessPipeline: {
        startNode: "validateHeader",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateHeader: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.validateHeader',
                success: 'evaluateHeaderOptions',
                failure: 'failureEnd'
            },
            evaluateHeaderOptions: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.evaluateHeaderOptions',
                success: 'evaluateHeaderQuery',
                failure: 'failureEnd'
            },
            evaluateHeaderQuery: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.evaluateHeaderQuery',
                success: 'evaluateHeaderMacros',
                failure: 'failureEnd'
            },
            evaluateHeaderMacros: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.evaluateHeaderMacros',
                success: 'loadRawSchema',
                failure: 'failureEnd'
            },
            loadRawSchema: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.loadRawSchema',
                success: 'loadModels',
                failure: 'failureEnd'
            },
            loadModels: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.loadModels',
                success: 'processHeaderFiles',
                failure: 'failureEnd'
            },
            processHeaderFiles: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.processHeaderFiles',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.handleErrorEnd'
            }
        }
    },

    processJsFileImportPipeline: {
        startNode: "loadFileData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadFileData: {
                type: 'function',
                handler: 'DefaultProcessJsFileImportService.loadFileData',
                success: 'importFileData',
                failure: 'failureEnd'
            },
            importFileData: {
                type: 'function',
                handler: 'DefaultProcessJsFileImportService.importFileData',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultProcessJsFileImportService.handleSucessEnd'
            },
            failureEnd: {
                type: 'function',
                handler: 'DefaultProcessJsFileImportService.handleFailureEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultProcessJsFileImportService.handleErrorEnd'
            }
        }
    },

    processCsvFileImportPipeline: {
        startNode: "loadFileData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadFileData: {
                type: 'function',
                handler: 'DefaultProcessCsvFileImportService.loadFileData',
                success: 'importFileData',
                failure: 'failureEnd'
            },
            importFileData: {
                type: 'function',
                handler: 'DefaultProcessCsvFileImportService.importFileData',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultProcessCsvFileImportService.handleSucessEnd'
            },
            failureEnd: {
                type: 'function',
                handler: 'DefaultProcessCsvFileImportService.handleFailureEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultProcessCsvFileImportService.handleErrorEnd'
            }
        }
    },

    modelImportPipeline: {
        startNode: "validateModelData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateModelData: {
                type: 'function',
                handler: 'DefaultModelImportService.validateModelData',
                success: 'populateDependancies',
                failure: 'failureEnd'
            },
            populateDependancies: {
                type: 'function',
                handler: 'DefaultModelImportService.populateDependancies',
                success: 'customizeFinalModel',
                failure: 'failureEnd'
            },
            customizeFinalModel: {
                type: 'process',
                handler: 'customizeFinalModelPipeline',
                success: 'insertData',
                failure: 'failureEnd'
            },
            insertData: {
                type: 'function',
                handler: 'DefaultModelImportService.insertData',
                success: 'handleInsertSuccess',
                failure: 'handleInsertFailure'
            },
            handleInsertSuccess: {
                type: 'process',
                handler: 'modelImportSuccessPipeline',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            handleInsertFailure: {
                type: 'process',
                handler: 'modelImportFailurePipeline',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelImportService.handleSucessEnd'
            },
            failureEnd: {
                type: 'function',
                handler: 'DefaultModelImportService.handleFailureEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultModelImportService.handleErrorEnd'
            }
        }
    },

    customizeFinalModelPipeline: {
        startNode: "verifyFinalModel",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            verifyFinalModel: {
                type: 'function',
                handler: 'DefaultCustomizeFinalModelService.verifyFinalModel',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    },

    modelImportSuccessPipeline: {
        startNode: "updateSuccessRow",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            updateSuccessRow: {
                type: 'function',
                handler: 'DefaultModelImportSuccessService.updateSuccessRow',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    },

    modelImportFailurePipeline: {
        startNode: "updateFailureRow",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            updateFailureRow: {
                type: 'function',
                handler: 'DefaultModelImportFailureService.updateFailureRow',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    },
};