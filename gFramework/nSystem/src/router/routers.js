/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSystem/src/router/routers
 * @description Defines nSystem route registration and HTTP exposure metadata.
 * @layer router
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    system: {
        fileResponses: {
            returnFileContent: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/file/data',
                method: 'POST',
                controller: 'DefaultFileController',
                operation: 'getFileContent',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/file/data',
                    body: {
                        type: 'static/entiry',
                        path: 'Path of external location to get list of files',
                        fileName: 'Name of file'
                    }
                }
            },
            downloadFile: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/file/download',
                method: 'POST',
                controller: 'DefaultFileController',
                operation: 'downloadFile',
                responseHandler: 'fileDownloadResponseHandler',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/file/download',
                    body: {
                        path: 'Path of external location to get list of files',
                        fileName: 'Name of file'
                    }
                }
            }
        },

        importInitData: {
            importInitPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/import/init',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importInitData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/init',
                    body: {
                        modules: 'List of modules to pick initial data or',
                        path: 'Path of external location to get list of files'
                    }
                }
            }
        },

        importCoreData: {
            importCorePost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/import/core',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importCoreData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/core',
                    body: {
                        modules: 'List of modules to pick initial data or',
                        path: 'Path of external location to get list of files'
                    }
                }
            }
        },

        importSampleData: {
            importSamplePost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/import/sample',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importSampleData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/sample',
                    body: {
                        modules: 'List of modules to pick initial data or',
                        path: 'Path of external location to get list of files'
                    }
                }
            }
        },

        importLocalData: {
            importLocalPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/import/local',
                method: 'POST',
                controller: 'DefaultImportController',
                operation: 'importLocalData',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/import/local',
                    body: {
                        inputPath: {
                            rootPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data",
                            dataPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/data",
                            headerPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/headers",
                            successPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/success",
                            errorPath: "/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/error"
                        }
                    }
                }
            }
        },

        changeLogLevel: {
            changeLevelPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/log/level',
                method: 'POST',
                controller: 'DefaultLogController',
                operation: 'changeLogLevel',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/log/level',
                    body: {
                        entityName: 'like EnterpriseService',
                        logLevel: 'like info, debug, error and all valid log levels'
                    }
                }
            }
        },

        changeConfig: {
            changeConfigPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.request.create',
                key: '/config',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'changeConfig',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/config',
                    body: {
                        configuration: 'Tenant property patch; sensitive values must use external configuration or a secret manager',
                        requestReason: 'Required organizational change context when policy demands it'
                    }
                }
            }
        },

        runtimeConfigurationRollback: {
            getRuntimeConfigurationHistory: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.history.view',
                key: '/config/runtime/history',
                method: 'GET',
                controller: 'DefaultConfigurationController',
                operation: 'getRuntimeConfigurationHistory',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/config/runtime/history'
                }
            },
            getRuntimeConfigurationGovernanceSummary: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.summary.view',
                key: '/config/runtime/summary',
                method: 'GET',
                controller: 'DefaultConfigurationController',
                operation: 'getRuntimeConfigurationGovernanceSummary',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/config/runtime/summary'
                }
            },
            previewRuntimeConfigurationGovernanceCleanupPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.cleanup.preview',
                key: '/config/runtime/cleanup/preview',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'previewRuntimeConfigurationGovernanceCleanup',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/cleanup/preview',
                    body: {
                        cleanupTarget: 'all, requests, or logs',
                        olderThanDays: 'Optional retention age in days',
                        allowPending: 'Defaults to false',
                        allowHighRisk: 'Defaults to false'
                    }
                }
            },
            cleanupRuntimeConfigurationGovernancePost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.cleanup.execute',
                key: '/config/runtime/cleanup',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'cleanupRuntimeConfigurationGovernance',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/cleanup',
                    body: {
                        dryRun: 'Must be false to apply cleanup',
                        confirmCleanup: 'Must be true to apply cleanup',
                        cleanupTarget: 'all, requests, or logs',
                        olderThanDays: 'Optional retention age in days',
                        allowPending: 'Defaults to false',
                        allowHighRisk: 'Defaults to false'
                    }
                }
            },
            previewRuntimeConfigurationPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.preview',
                key: '/config/runtime/preview',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'previewRuntimeConfiguration',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/preview',
                    body: {
                        configurationType: 'schemaConfiguration, routerConfiguration, or propertyConfiguration',
                        configurationCode: 'Optional code to fetch persisted runtime configuration',
                        configuration: 'Optional proposed runtime configuration payload'
                    }
                }
            },
            createRuntimeConfigurationActivationRequestPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.request.create',
                key: '/config/runtime/request',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'createRuntimeConfigurationActivationRequest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/request'
                }
            },
            getRuntimeConfigurationActivationRequests: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.request.view',
                key: '/config/runtime/request',
                method: 'GET',
                controller: 'DefaultConfigurationController',
                operation: 'getRuntimeConfigurationActivationRequests',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/config/runtime/request'
                }
            },
            approveRuntimeConfigurationActivationRequestPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.request.approve',
                key: '/config/runtime/request/approve',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'approveRuntimeConfigurationActivationRequest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/request/approve'
                }
            },
            rejectRuntimeConfigurationActivationRequestPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.request.reject',
                key: '/config/runtime/request/reject',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'rejectRuntimeConfigurationActivationRequest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/request/reject'
                }
            },
            activateRuntimeConfigurationActivationRequestPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.request.activate',
                key: '/config/runtime/request/activate',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'activateRuntimeConfigurationActivationRequest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/request/activate'
                }
            },
            rollbackRuntimeConfigurationPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'runtime.config.rollback',
                key: '/config/runtime/rollback',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'rollbackRuntimeConfiguration',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/config/runtime/rollback',
                    body: {
                        activationCode: 'Code of configurationActivationLog entry to rollback'
                    }
                }
            }
        },

        apiContracts: {
            getOpenApiContract: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.contract.openapi.view',
                key: '/contract/openapi',
                method: 'GET',
                controller: 'DefaultApiContractController',
                operation: 'getOpenApiContract',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/contract/openapi'
                }
            }
        },

        updateAllIndexes: {
            updateAllModulesIndexes: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schema/indexes/all',
                method: 'GET',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateModulesIndexes',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes/all'
                }
            },
        },

        /* ------------------------------- */
        testRunner: {
            runAllUTest: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/test/runUTest',
                method: 'GET',
                controller: 'TestExecutionController',
                operation: 'runUTest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/test/runUTest',
                }
            },
            runAllNTest: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/test/runNTest',
                method: 'GET',
                controller: 'TestExecutionController',
                operation: 'runNTest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/test/runNTest',
                }
            }
        },


        dataExport: {
            exportGet: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/export',
                method: 'GET',
                controller: 'DataExportController',
                operation: 'export',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/export',
                }
            },
            exportPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/export',
                method: 'POST',
                controller: 'DataExportController',
                operation: 'export',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/export',
                }
            }
        }
    }
};
