/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    search: {
        search: {
            super: 'super',
            model: true,
            service: true,
            event: false,
            router: false,
            definition: {
                enterpriseCode: {
                    required: false
                },
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

        indexer: {
            super: 'base',
            model: true,
            service: true,
            event: false,
            router: true,
            definition: {
                enabled: {
                    type: 'bool',
                    required: true,
                    description: 'Required, If this index is enabled'
                },
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
                preProcessor: {
                    type: 'string',
                    required: false,
                    description: 'Optional indexer pre processor'
                },
                postProcessor: {
                    type: 'string',
                    required: false,
                    description: 'Optional indexer post processor'
                },
                properties: {
                    type: 'object',
                    required: false
                }
            }
        }
    }
};