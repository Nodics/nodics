/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDatabase/database/config/properties
 * @description Defines default nDatabase configuration used during module startup and layering.
 * @layer config
 * @owner nDatabase
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {

    defaultPageSize: 10,
    defaultPageNumber: 1,
    queryMaxTimeMS: 1000,

    externalSchemaLocation: CONFIG.get('externalDataLocation') + '/schema',
    accessPoints: {
        readAccessPoint: 1,
        writeAccessPoint: 2,
        removeAccessPoint: 3,
        fullAccessPoint: 10
    },
    database: {
        default: {
            options: {
                databaseType: 'mongodb', //for Cassandra use 'cassandra'
                cleanOrphan: true
            },
        }
    }
};