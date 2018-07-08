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
                success: 'importFromFileProcess',
                failure: 'handleDirectImport'
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
        startNode: "placeholder",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            loadInternalDataFileList: {
                type: 'function',
                process: 'DirectDataImportProc.placeholder',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            loadExternalDataFileList: {
                type: 'function',
                process: 'DirectDataImportProc.placeholder',
                success: 'successEnd',
                failure: 'failureEnd'
            },
            mergeFileList: {
                type: 'function',
                process: 'DirectDataImportProc.placeholder',
                success: 'successEnd',
                failure: 'failureEnd'
            },

        }
    }
};