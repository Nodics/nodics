/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    schemaUpdatedPipeline: {
        startNode: "validateSchema",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateSchema: {
                type: 'function',
                handler: 'DefaultSchemaUpdatedPipelineService.validateSchema',
                success: 'retrieveSchema'
            },
            retrieveSchema: {
                type: 'function',
                handler: 'DefaultSchemaUpdatedPipelineService.retrieveSchema',
                success: 'redirectRequest'
            },
            redirectRequest: {
                type: 'function',
                handler: 'DefaultSchemaUpdatedPipelineService.redirectRequest',
                success: {
                    schemaActivated: 'schemaActivated',
                    schemaDeActivated: 'schemaDeActivated'
                }
            },
            schemaActivated: {
                type: 'process',
                handler: 'schemaActivatedPipeline',
                success: 'successEnd'
            },

            schemaDeActivated: {
                type: 'process',
                handler: 'schemaDeActivatedPipeline',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultSchemaUpdatedPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultSchemaUpdatedPipelineService.handleErrorEnd'
            }
        }
    },

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
                success: 'buildSearchSchema'
            },
            buildSearchSchema: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.buildSearchSchema',
                success: 'buildSearchModels'
            },
            buildSearchModels: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.buildSearchModels',
                success: 'updateSearchIndexes'
            },
            updateSearchIndexes: {
                type: 'function',
                handler: 'DefaultSchemaActivatedPipelineService.updateSearchIndexes',
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
            }
        }
    },

    schemaDeActivatedPipeline: {
        startNode: "validateSchema",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateSchema: {
                type: 'function',
                handler: 'DefaultSchemaDeActivatedPipelineService.validateSchema',
                success: 'deactivateRawSchema'
            },
            deactivateRawSchema: {
                type: 'function',
                handler: 'DefaultSchemaDeActivatedPipelineService.deactivateRawSchema',
                success: 'removeModels'
            },
            removeModels: {
                type: 'function',
                handler: 'DefaultSchemaDeActivatedPipelineService.removeModels',
                success: 'successEnd'
            },
            removeSearchModels: {
                type: 'function',
                handler: 'DefaultSchemaDeActivatedPipelineService.removeSearchModels',
                success: 'successEnd'
            }
        }
    },
};