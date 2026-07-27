/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/router/routers
 * @description Defines nData route registration and HTTP exposure metadata.
 * @layer router
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    import: {
        dataReleases: {
            catalogue: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.view',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/data-releases',
                method: 'GET',
                controller: 'DefaultDataReleaseController',
                operation: 'getCatalogue'
            },
            preflight: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.validate',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/data-releases/preflight',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'preflight'
            },
            executeInit: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.init.run',
                apiExposure: 'dataImport',
                key: '/data-releases/init/imports',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'executeInit'
            },
            executeCore: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.core.run',
                apiExposure: 'dataImport',
                key: '/data-releases/core/imports',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'executeCore'
            },
            executeSample: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.sample.run',
                apiExposure: 'dataImport',
                key: '/data-releases/sample/imports',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'executeSample'
            }
        },
        importRunHistory: {
            getImportRunHistory: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.history.view',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
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
                permission: 'import.history.detail.view',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
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
