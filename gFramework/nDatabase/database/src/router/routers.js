/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
 */
module.exports = {
    common: {
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
