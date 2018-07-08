/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    defaultDataImportPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDataImportService.validateRequest',
                success: 'redirectToImportType',
                failure: 'failureEnd'
            },
            redirectToImportType: {
                type: 'function',
                handler: 'DefaultDataImportService.redirectToImportType',
                success: {
                    fileImport: 'importFromFile',
                    directImport: 'importFromDirect'
                },
                failure: 'failureEnd'
            },
            importFromFile: {
                type: 'process',
                handler: 'importFromFilePipeline',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            importFromDirect: {
                type: 'process',
                handler: 'importFromDirectPipeline',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultDataImportService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'DefaultDataImportService.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                handler: 'DefaultDataImportService.handleErrorEnd'
            }
        }
    },

    importFromDirectPipeline: {
        startNode: "placeholder",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            placeholder: {
                type: 'function',
                handler: 'DirectDataImportService.placeholder',
                success: 'successEnd',
                failure: 'failureEnd'
            },
        }
    },

    importFromFilePipeline: {
        startNode: "loadInternalDataFileList",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadInternalDataFileList: {
                type: 'function',
                handler: 'ProcessFilesImportService.loadInternalDataFileList',
                success: 'loadExternalDataFileList',
                failure: 'failureEnd'
            },
            loadExternalDataFileList: {
                type: 'function',
                handler: 'ProcessFilesImportService.loadExternalDataFileList',
                success: 'mergeFileList',
                failure: 'failureEnd'
            },
            mergeFileList: {
                type: 'function',
                handler: 'ProcessFilesImportService.mergeFileList',
                success: 'processFiles',
                failure: 'failureEnd'
            },
            processFiles: {
                type: 'function',
                handler: 'ProcessFilesImportService.processFiles',
                success: 'successEnd',
                failure: 'failureEnd'
            }

        }
    },

    fileImportPipeline: {
        startNode: "loadFileData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadFileData: {
                type: 'function',
                handler: 'ProcessFileImportService.loadFileData',
                success: 'importFileData',
                failure: 'failureEnd'
            },
            importFileData: {
                type: 'function',
                handler: 'ProcessFileImportService.importFileData',
                success: 'successEnd',
                failure: 'failureEnd'
            },

            successEnd: {
                type: 'function',
                handler: 'ProcessFileImportService.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                handler: 'ProcessFileImportService.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                handler: 'ProcessFileImportService.handleErrorEnd'
            }
        }
    },
};