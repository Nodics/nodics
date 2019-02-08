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
                success: 'redirectToImportType'
            },
            redirectToImportType: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.redirectToImportType',
                success: {
                    fileImport: 'importFromFile',
                    directImport: 'importFromDirect'
                }
            },
            importFromFile: {
                type: 'process',
                handler: 'fileDataImportInitializerPipeline',
                success: 'successEnd'
            },
            importFromDirect: {
                type: 'process',
                handler: 'directDataImportInitializerPipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataImportInitializerService.handleSucessEnd'
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
                success: 'successEnd'
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
                success: 'loadInternalDataFileList'
            },
            loadInternalDataFileList: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.loadInternalDataFileList',
                success: 'loadExternalHeaderFileList'
            },
            loadExternalHeaderFileList: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.loadExternalHeaderFileList',
                success: 'loadExternalDataFileList'
            },
            loadExternalDataFileList: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.loadExternalDataFileList',
                success: 'resolveFileType'
            },

            resolveFileType: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.resolveFileType',
                success: 'buildHeaderInstances'
            },
            buildHeaderInstances: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.buildHeaderInstances',
                success: 'assignDataFilesToHeader'
            },
            assignDataFilesToHeader: {
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.assignDataFilesToHeader',
                success: 'processInternalDataHeaders'
            },
            processInternalDataHeaders: {// Loop through all headers available for internal data
                type: 'function',       // Call headerProcessPipeline for each header
                handler: 'DefaultFileDataImportInitializerService.processInternalDataHeaders',
                success: 'processExternalDataHeaders'
            },
            processExternalDataHeaders: {// Loop through all headers available for external data
                type: 'function',
                handler: 'DefaultFileDataImportInitializerService.processExternalDataHeaders',
                success: 'successEnd'
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
                success: 'evaluateHeaderOptions'
            },
            evaluateHeaderOptions: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.evaluateHeaderOptions',
                success: 'evaluateHeaderQuery'
            },
            evaluateHeaderQuery: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.evaluateHeaderQuery',
                success: 'evaluateHeaderMacros'
            },
            evaluateHeaderMacros: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.evaluateHeaderMacros',
                success: 'loadRawSchema'
            },
            loadRawSchema: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.loadRawSchema',
                success: 'loadModels'
            },
            loadModels: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.loadModels',
                success: 'processHeaderFiles'
            },
            processHeaderFiles: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.processHeaderFiles',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultHeaderProcessService.handleSucessEnd'
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
                success: 'importFileData'
            },
            importFileData: {
                type: 'function',
                handler: 'DefaultProcessJsFileImportService.importFileData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultProcessJsFileImportService.handleSucessEnd'
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
                success: 'importFileData'
            },
            importFileData: {
                type: 'function',
                handler: 'DefaultProcessCsvFileImportService.importFileData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultProcessCsvFileImportService.handleSucessEnd'
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
                success: 'populateDependancies'
            },
            populateDependancies: {
                type: 'function',
                handler: 'DefaultModelImportService.populateDependancies',
                success: 'customizeFinalModel'
            },
            customizeFinalModel: {
                type: 'process',
                handler: 'customizeFinalModelPipeline',
                success: 'insertData'
            },
            insertData: {
                type: 'function',
                handler: 'DefaultModelImportService.insertData',
                success: {
                    insertSuccess: 'handleInsertSuccess',
                    insertFailure: 'handleInsertFailure'
                }
            },
            handleInsertSuccess: {
                type: 'process',
                handler: 'modelImportSuccessPipeline',
                success: 'successEnd'
            },
            handleInsertFailure: {
                type: 'process',
                handler: 'modelImportFailurePipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelImportService.handleSucessEnd'
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
                success: 'successEnd'
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
                success: 'successEnd'
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
                success: 'successEnd'
            }
        }
    },
};