/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        directImports: {
            importInitPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.init.run',
                apiExposure: 'dataImport',
                key: '/init',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importInitData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/import/v0/init',
                    body: {
                        modules: 'Optional list of modules to import initialization data from',
                        path: 'Optional external location containing import files'
                    }
                }
            },
            importCorePost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.core.run',
                apiExposure: 'dataImport',
                key: '/core',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importCoreData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/import/v0/core',
                    body: {
                        modules: 'Optional list of modules to import core data from',
                        path: 'Optional external location containing import files'
                    }
                }
            },
            importSamplePost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.sample.run',
                apiExposure: 'dataImport',
                key: '/sample',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importSampleData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/import/v0/sample',
                    body: {
                        modules: 'Optional list of modules to import sample data from',
                        path: 'Optional external location containing import files'
                    }
                }
            },
            importLocalPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.local.run',
                apiExposure: 'dataImport',
                key: '/local',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importLocalData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/import/v0/local',
                    body: {
                        inputPath: {
                            rootPath: 'Absolute local import package path',
                            dataPath: 'Optional data file directory override',
                            headerPath: 'Optional header file directory override',
                            successPath: 'Optional success archive directory override',
                            errorPath: 'Optional error archive directory override'
                        }
                    }
                }
            },
            importMediaPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.media.run',
                apiExposure: 'dataImport',
                key: '/media',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importMediaData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/import/v0/media',
                    body: {
                        mediaCode: 'nMedia record code returned by the governed upload API',
                        moduleName: 'Owning module for a generic schema-backed import target',
                        schemaName: 'Owning schema/model for the records inside the uploaded file',
                        operation: 'Optional schema operation, defaults to saveAll for schema-backed imports',
                        definitionCode: 'Optional future nImport template code for reusable mappings; not required for generic schema-backed import',
                        options: {
                            validateOnly: 'When true, validate media and definition staging without importing records'
                        }
                    }
                }
            }
        },
        dataReleases: {
            catalogueInit: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.view',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/init',
                method: 'GET',
                controller: 'DefaultDataReleaseController',
                operation: 'getCatalogue'
            },
            catalogueCore: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.view',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/core',
                method: 'GET',
                controller: 'DefaultDataReleaseController',
                operation: 'getCatalogue'
            },
            catalogueSample: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.view',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/sample',
                method: 'GET',
                controller: 'DefaultDataReleaseController',
                operation: 'getCatalogue'
            },
            preflightInit: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.validate',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/init/validate',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'preflight'
            },
            preflightCore: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.validate',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/core/validate',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'preflight'
            },
            preflightSample: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.release.validate',
                permissions: ['import.core.run'],
                apiExposure: 'dataImport',
                key: '/sample/validate',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'preflight'
            },
            executeInit: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.init.run',
                apiExposure: 'dataImport',
                key: '/init/install',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'executeInit'
            },
            executeCore: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.core.run',
                apiExposure: 'dataImport',
                key: '/core/install',
                method: 'POST',
                controller: 'DefaultDataReleaseController',
                operation: 'executeCore'
            },
            executeSample: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.sample.run',
                apiExposure: 'dataImport',
                key: '/sample/install',
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
                        mediaCode: 'Optional nMedia code for media-backed import run lookup',
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
