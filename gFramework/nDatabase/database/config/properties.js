/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

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
    databaseTransactions: {
        enabled: true,
        failClosed: true,
        maximumCommitTimeMs: 5000
    },
    referenceIntegrity: {
        enabled: true,
        failClosed: true,
        maximumTargetRecords: 100,
        maximumRelationships: 100
    },
    schemaWorkbench: {
        discoverModelsByDefault: true,
        defaultModelOperations: ['search', 'read', 'create', 'update', 'delete'],
        defaultRelationshipActions: ['SELECT_EXISTING', 'CREATE_RELATED'],
        defaultMutationMode: 'GENERATED_CRUD',
        defaultPageSize: 25,
        allowedPageSizes: [10, 25, 50],
        maximumPageSize: 50,
        maximumSearchLength: 100,
        maximumFilterConditions: 20,
        maximumFilterDepth: 3,
        maximumBulkItems: 100,
        maximumAggregatePayloadBytes: 50000
    },
    schemaPolicies: {},

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
