/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    schemaActivatedPipeline: {
        startNode: "validateSchema",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateSchema: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.validateSchema',
                success: 'buildRawSchema'
            },
            buildRawSchema: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.buildRawSchema',
                success: 'buildModels'
            },
            buildModels: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.buildModels',
                success: 'buildServices'
            },
            buildServices: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.buildServices',
                success: 'buildFacades'
            },
            buildFacades: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.buildFacades',
                success: 'buildController'
            },
            buildController: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.buildController',
                success: 'activateRouters'
            },
            activateRouters: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.activateRouters',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.handleErrorEnd'
            }
        }
    },
};