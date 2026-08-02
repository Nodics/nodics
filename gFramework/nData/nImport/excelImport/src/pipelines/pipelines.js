/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nImport/excelImport/src/pipelines/pipelines
 * @description Defines nData pipeline wiring and execution contracts.
 * @layer pipelines
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    excelFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultExcelFileDataProcessService.processDataChunk',
                success: 'successEnd'
            }
        }
    }
};