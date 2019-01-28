/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    search: {
        default: {
            elastic: {
                options: {
                    connectionHandler: 'DefaultElasticSearchEngineConnectionHandlerService',
                    schemaHandler: 'DefaultElasticSearchSchemaHandlerService',
                    fullIndexDataQuery: {},
                    incrementalIndexDataQuery: {},

                    refreshOptions: {
                        ignoreUnavailable: false,
                        expandWildcards: all
                    }
                },
                connection: {
                    hosts: ['http://localhost:9200'],
                    log: 'info',
                    deadTimeout: 1000
                }
            }
        }
    }
};