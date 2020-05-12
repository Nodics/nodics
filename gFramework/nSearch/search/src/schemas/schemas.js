/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    search: {
        /**
         * This is placeholder schema to generate service layer
         */
        search: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            definition: {
                indexName: {
                    type: 'string',
                    required: true,
                    description: 'Required index name'
                },
                typeName: {
                    type: 'string',
                    required: false,
                    description: 'Required type name, One index could have multiple types'
                },
                lastState: {
                    type: 'string',
                    required: true,
                    default: 'NEW',
                    description: 'State of last execution (SUCESS, ERROR, NEW)'
                },
                endTime: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp',
                    description: 'Timestamp when this item got updated in database'
                }
            }
        },

        /**
         * This schema is used to update or create indexes definitions. 
         * Value defined here will replace all value defined once schema definition
         */
        index: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {
                indexName: {
                    type: 'string',
                    required: true,
                    description: 'Required unique index name'
                },
                typeName: {
                    type: 'string',
                    required: false,
                    description: 'Required type name, One index could have multiple types'
                },
                idPropertyName: {
                    type: 'string',
                    required: true,
                    description: 'Required name of property which can be used as unique key'
                },
                moduleNane: {
                    type: 'string',
                    required: true,
                    description: 'Required moduleNane name'
                },
                properties: {
                    type: 'object',
                    required: false
                }
            }
        },

        /**
         * This is placeholder schema to generate service layer
         */
        indexer: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Required indexer name'
                },
                incremental: {
                    type: 'bool',
                    required: true,
                    description: 'Mandate, if true, will be partial else full'
                },
                type: {
                    required: true,
                    enum: [ENUMS.IndexerType.INTERNAL.key, ENUMS.IndexerType.EXTERNAL.key],
                    default: ENUMS.IndexerType.INTERNAL.key,
                    description: 'Required indexer name'
                },
                finalizeData: {
                    type: 'bool',
                    required: false,
                    description: 'If true, temp files will be create, else will be imported directly'
                },
                logResult: {
                    type: 'bool',
                    required: true,
                    description: 'If true, error or sucess result will be logged'
                },
                schema: {
                    type: 'object',
                    required: false,
                    description: 'Optional schema object, which contain name and module, source of data'
                },
                "schema.name": {
                    type: 'string',
                    required: false,
                    description: 'Optional schemaName'
                },
                "schema.moduleName": {
                    type: 'string',
                    required: false,
                    description: 'Optional schemaName'
                },
                "schema.queryOptions": {
                    type: 'object',
                    required: false,
                    description: 'Optional queryOptions to fatch data from schema'
                },
                "schema.query": {
                    type: 'object',
                    required: false,
                    description: 'Optional query to fatch data from schema'
                },
                path: {
                    type: 'object',
                    required: false,
                    description: 'Optional object to index non-schema data'
                },
                "path.isFinalized": {
                    type: 'bool',
                    required: false,
                    description: 'True, if data is compatable to index. False, if conversion required'
                },
                "path.rootPath": {
                    type: 'string',
                    required: false,
                    description: 'root folder where data exist'
                },
                "path.successPath": {
                    type: 'string',
                    required: false,
                    description: 'Success path to move imported files'
                },
                "path.errorPath": {
                    type: 'string',
                    required: false,
                    description: 'Error path to move imported files'
                },
                target: {
                    type: 'object',
                    required: false,
                    description: 'Target index detail, where all data will go'
                },
                "target.indexName": {
                    type: 'string',
                    required: false,
                    description: 'Target index name, where all data will go'
                },
                "target.typeName": {
                    type: 'string',
                    required: false,
                    description: 'Target type name, where all data will go'
                },
                "target.options": {
                    type: 'object',
                    required: false,
                    description: 'Index options if required'
                },
                "target.tempRootPath": {
                    type: 'string',
                    required: false,
                    description: 'True, if data is compatable to index. False, if conversion required'
                },
                "target.successPath": {
                    type: 'string',
                    required: false,
                    description: 'Success path to move imported files'
                },
                "target.errorPath": {
                    type: 'string',
                    required: false,
                    description: 'Error path to move imported files'
                },
                processors: {
                    type: 'array',
                    required: false,
                    description: 'Array of processors to manipulate fatched data'
                },
                processPipeline: {
                    type: 'string',
                    required: false,
                    description: 'Optional, pipeline if required for this indexer'
                },
                state: {
                    required: true,
                    enum: [ENUMS.IndexerState.NEW.key, ENUMS.IndexerState.RUNNING.key, ENUMS.IndexerState.SUCCESS.key, ENUMS.IndexerState.ERROR.key],
                    default: ENUMS.IndexerState.NEW.key,
                    description: 'State of last execution (SUCESS, ERROR, NEW)'
                },
                lastErrorLog: {
                    type: 'array',
                    required: false,
                    description: 'Last error log'
                }
            }
        },

        indexerLog: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            refSchema: {
                tenant: {
                    enabled: true,
                    schemaName: "indexer",
                    type: 'one',
                    propertyName: 'code'

                },
            },
            definition: {
                indexerCode: {
                    type: 'string',
                    required: true
                },
                indexer: {
                    type: 'string',
                    required: true,
                    description: 'Required Code of associated indexer',
                },
            }
        },
    }
};