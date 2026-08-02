/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nSearch/elastic/config/properties
 * @description Defines default nSearch configuration used during module startup and layering.
 * @layer config
 * @owner nSearch
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    search: {
        dataTypeMap: {
            default: 'text',
            objectId: 'nested',
            array: 'nested',
            string: 'text'
        },
        default: {
            elastic: {
                options: {
                    connectionHandler: 'DefaultElasticSearchEngineConnectionHandlerService',
                    schemaHandler: 'DefaultElasticSearchSchemaHandlerService',
                    fullIndexDataQuery: {},
                    incrementalIndexDataQuery: {},

                    existsOptions: {
                        //level: 'indices'
                    },

                    healthOptions: {
                        level: 'indices'
                    },

                    saveOptions: {
                        op_type: 'index'
                    },

                    bulkOptions: {
                        op_type: 'create'
                    },

                    searchOptions: {

                    },

                    removeOptions: {

                    },

                    removeIndexOptions: {

                    },

                    schemaGetOptions: {

                    },

                    schemaPutOptions: {
                    },

                    refreshOptions: {
                        ignore_unavailable: false,
                        expand_wildcards: 'all'
                    }

                },
                connection: {
                    hosts: ['http://localhost:9200'],
                    log: 'info',
                    deadTimeout: 1000
                }
            }
        },

        // profile: {
        //     elastic: {
        //         options: {
        //             connectionHandler: 'DefaultElasticSearchEngineConnectionHandlerService',
        //             schemaHandler: 'DefaultElasticSearchSchemaHandlerService',
        //             fullIndexDataQuery: {},
        //             incrementalIndexDataQuery: {},

        //             existsOptions: {
        //                 //level: 'indices'
        //             },

        //             healthOptions: {
        //                 level: 'indices'
        //             },

        //             saveOptions: {
        //                 op_type: 'index'
        //             },

        //             bulkOptions: {
        //                 op_type: 'create'
        //             },

        //             searchOptions: {

        //             },

        //             removeOptions: {

        //             },

        //             removeIndexOptions: {

        //             },

        //             schemaGetOptions: {

        //             },

        //             schemaPutOptions: {

        //             },

        //             refreshOptions: {
        //                 ignore_unavailable: false,
        //                 expand_wildcards: 'all'
        //             }

        //         },
        //         connection: {
        //             hosts: ['http://localhost:9200'],
        //             log: 'info',
        //             deadTimeout: 1000
        //         }
        //     }
        // }
    }
};
