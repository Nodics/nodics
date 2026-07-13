/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/jsonImport/src/pipelines/pipelinesDefinition
 * @description Defines nData pipeline wiring and execution contracts.
 * @layer pipelines
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    jsonFileDataInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.validateRequest',
                success: 'processDataChunk'
            },
            processDataChunk: {
                type: 'function',
                handler: 'DefaultJsonFileDataProcessService.processDataChunk',
                success: 'successEnd'
            }
        }
    },

};