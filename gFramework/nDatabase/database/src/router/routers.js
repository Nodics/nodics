/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/router/DatabaseRouter
 * @description Secured router definitions for schema index and schema validator
 * maintenance APIs. These routes expose admin operations used to refresh
 * generated database structures after schema changes.
 * @layer router
 * @owner nDatabase
 * @override Project modules may override these route definitions to adjust
 * access groups, API paths, or controller operations while preserving schema
 * maintenance capability.
 *
 * @property {Object} common.schemaIndexes Schema index refresh routes.
 * @property {Object} common.schemaValidation Schema validator refresh routes.
 * @property {Object} common.schemaWorkbench Client-safe schema discovery routes.
 */
module.exports = {
    common: {
        schemaWorkbench: {
            listSchemas: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.workbench.view',
                apiExposure: 'schemaWorkbench',
                key: '/schema/workbench',
                method: 'GET',
                controller: 'DefaultSchemaWorkbenchController',
                operation: 'list'
            },
            getSchema: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.workbench.view',
                apiExposure: 'schemaWorkbench',
                key: '/schema/workbench/:schema',
                method: 'GET',
                controller: 'DefaultSchemaWorkbenchController',
                operation: 'get'
            },
            searchRecords: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.workbench.view',
                apiExposure: 'schemaWorkbench',
                key: '/schema/workbench/:schema/records',
                method: 'POST',
                controller: 'DefaultSchemaWorkbenchController',
                operation: 'search'
            },
            previewDeleteImpact: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.workbench.view',
                apiExposure: 'schemaWorkbench',
                key: '/schema/workbench/:schema/delete-impact',
                method: 'POST',
                controller: 'DefaultSchemaWorkbenchController',
                operation: 'previewDeleteImpact'
            },
            deleteRecord: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.workbench.manage',
                apiExposure: 'schemaWorkbench',
                key: '/schema/workbench/:schema/record',
                method: 'DELETE',
                controller: 'DefaultSchemaWorkbenchController',
                operation: 'deleteRecord'
            },
            bulkRecords: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.workbench.manage',
                apiExposure: 'schemaWorkbench',
                key: '/schema/workbench/:schema/bulk',
                method: 'POST',
                controller: 'DefaultSchemaWorkbenchController',
                operation: 'bulk'
            },
            aggregateOperation: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.workbench.manage',
                apiExposure: 'schemaWorkbench',
                key: '/schema/workbench/:schema/aggregate',
                method: 'POST',
                controller: 'DefaultSchemaWorkbenchController',
                operation: 'aggregate'
            }
        },
        schemaIndexes: {
            updateSchemaIndexesBySchemaName: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.index.rebuild',
                apiExposure: 'schemaMaintenance',
                key: '/schema/indexes/schema/:schema',
                method: 'POST',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateSchemaIndexes',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes/schema/:schema'
                }
            },
            updateSchemaIndexesByModuleName: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.index.rebuild',
                apiExposure: 'schemaMaintenance',
                key: '/schema/indexes',
                method: 'POST',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateSchemaIndexes',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes'
                }
            }
        },
        schemaValidation: {
            updateSchemaValidatorBySchemaName: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.validator.rebuild',
                apiExposure: 'schemaMaintenance',
                key: '/schema/validator/schema/:schema',
                method: 'POST',
                controller: 'DefaultSchemaValidatorController',
                operation: 'updateSchemaValidator',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schema/validator/schema/:schema'
                }
            },
            updateSchemaValidatorByModuleName: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.validator.rebuild',
                apiExposure: 'schemaMaintenance',
                key: '/schema/validator',
                method: 'POST',
                controller: 'DefaultSchemaValidatorController',
                operation: 'updateSchemaValidator',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schema/validator'
                }
            }
        }
    }
};
