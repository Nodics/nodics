/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
                key: '/schema/indexes/schema/:schema',
                method: 'GET',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateSchemaIndexes',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes/schema/:schema'
                }
            },
            updateSchemaIndexesByModuleName: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schema/indexes',
                method: 'GET',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateSchemaIndexes',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes'
                }
            }
        },
        schemaValidation: {
            updateSchemaValidatorBySchemaName: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schema/validator/schema/:schema',
                method: 'GET',
                controller: 'DefaultSchemaValidatorController',
                operation: 'updateSchemaValidator',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/validator/schema/:schema'
                }
            },
            updateSchemaValidatorByModuleName: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schema/validator',
                method: 'GET',
                controller: 'DefaultSchemaValidatorController',
                operation: 'updateSchemaValidator',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/validator'
                }
            }
        }
    }
};
