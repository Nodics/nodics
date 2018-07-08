/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    defaultDataImportProcess: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                process: 'DefaultDataImportProc.validateRequest',
                success: 'redirectToImportType',
                failure: 'failureEnd'
            },
            redirectToImportType: {
                type: 'function',
                process: 'DefaultDataImportProc.redirectToImportType',
                success: {
                    fileImport: 'importFromFileProcess',
                    directImport: 'importFromDirectProcess'
                },
                failure: 'failureEnd'
            },
            importFromFileProcess: {
                type: 'process',
                process: 'importFromFileProcess',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            importFromDirectProcess: {
                type: 'process',
                process: 'importFromDirectProcess',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            successEnd: {
                type: 'function',
                process: 'DefaultDataImportProc.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                process: 'DefaultDataImportProc.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                process: 'DefaultDataImportProc.handleErrorEnd'
            }
        }
    },

    importFromDirectProcess: {
        startNode: "placeholder",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            placeholder: {
                type: 'function',
                process: 'DirectDataImportProc.placeholder',
                success: 'successEnd',
                failure: 'failureEnd'
            },
        }
    },

    importFromFileProcess: {
        startNode: "loadInternalDataFileList",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadInternalDataFileList: {
                type: 'function',
                process: 'ProcessFilesImportProc.loadInternalDataFileList',
                success: 'loadExternalDataFileList',
                failure: 'failureEnd'
            },
            loadExternalDataFileList: {
                type: 'function',
                process: 'ProcessFilesImportProc.loadExternalDataFileList',
                success: 'mergeFileList',
                failure: 'failureEnd'
            },
            mergeFileList: {
                type: 'function',
                process: 'ProcessFilesImportProc.mergeFileList',
                success: 'processFiles',
                failure: 'failureEnd'
            },
            processFiles: {
                type: 'function',
                process: 'ProcessFilesImportProc.processFiles',
                success: 'successEnd',
                failure: 'failureEnd'
            }

        }
    },

    fileImportProcess: {
        startNode: "loadFileData",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadFileData: {
                type: 'function',
                process: 'ProcessFileImportProc.loadFileData',
                success: 'importFileData',
                failure: 'failureEnd'
            },
            importFileData: {
                type: 'function',
                process: 'ProcessFileImportProc.importFileData',
                success: 'successEnd',
                failure: 'failureEnd'
            },

            successEnd: {
                type: 'function',
                process: 'ProcessFileImportProc.handleSucessEnd'
            },

            failureEnd: {
                type: 'function',
                process: 'ProcessFileImportProc.handleFailureEnd'
            },

            handleError: {
                type: 'function',
                process: 'ProcessFileImportProc.handleErrorEnd'
            }
        }
    },
};