/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/router/router
 * @description Defines nData route registration and HTTP exposure metadata.
 * @layer router
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    import: {
        importRunHistory: {
            getImportRunHistory: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/run/history',
                method: 'GET',
                controller: 'DefaultImportRunHistoryController',
                operation: 'getImportRunHistory',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/import/v0/run/history',
                    query: {
                        runId: 'Optional import run id',
                        status: 'Optional import run status',
                        dataType: 'Optional import data type',
                        tenant: 'Optional tenant code',
                        moduleName: 'Optional module name',
                        limit: 'Optional page size',
                        skip: 'Optional page offset'
                    }
                }
            },
            getImportRun: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/run/history/:runId',
                method: 'GET',
                controller: 'DefaultImportRunHistoryController',
                operation: 'getImportRun',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/import/v0/run/history/:runId'
                }
            }
        }
    }
};
