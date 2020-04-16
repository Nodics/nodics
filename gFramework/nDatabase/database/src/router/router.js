/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    common: {
        schemaIndexes: {
            updateSchemaIndexesBySchemaName: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/schema/indexes/schema/:schema',
                method: 'GET',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateSchemaIndexes',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes/schema/:schema'
                }
            },
            updateSchemaIndexesByModuleName: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/schema/indexes',
                method: 'GET',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateSchemaIndexes',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes'
                }
            }
        },
        schemaValidation: {
            updateSchemaValidatorBySchemaName: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/schema/validator/schema/:schema',
                method: 'GET',
                controller: 'DefaultSchemaValidatorController',
                operation: 'updateSchemaValidator',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/validator/schema/:schema'
                }
            },
            updateSchemaValidatorByModuleName: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/schema/validator',
                method: 'GET',
                controller: 'DefaultSchemaValidatorController',
                operation: 'updateSchemaValidator',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/validator'
                }
            }
        }
    }
};