/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gDeap/dataConsumer/src/pipelines/pipelines
 * @description Defines dataConsumer pipeline wiring and execution contracts.
 * @layer pipelines
 * @owner dataConsumer
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    processInternalDataPushEventPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.validateRequest',
                success: 'prepareHeader'
            },
            prepareHeader: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.prepareHeader',
                success: 'prepareInputPath'
            },
            prepareInputPath: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.prepareInputPath',
                success: 'prepareOutputPath'
            },
            prepareOutputPath: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.prepareOutputPath',
                success: 'flushOutputFolder'
            },
            flushOutputFolder: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.flushOutputFolder',
                success: 'processData'
            },
            processData: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.processData',
                success: 'importFinalizeData'
            },
            importFinalizeData: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.importFinalizeData',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultInternalDataConsumeProcessService.handleErrorEnd'
            }
        }
    }
};