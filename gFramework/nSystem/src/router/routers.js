/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        health: {
            getLiveness: {
                secured: false,
                accessGroups: ['userGroup'],
                publicProbe: true,
                key: '/health/live',
                method: 'GET',
                controller: 'DefaultHealthController',
                operation: 'getLiveness',
                help: {
                    requestType: 'public',
                    message: 'Low-disclosure process liveness probe. Do not include secrets, topology paths, provider endpoints, or tenant data.',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/health/live'
                }
            },
            getReadiness: {
                secured: false,
                accessGroups: ['userGroup'],
                publicProbe: true,
                apiExposure: 'operationalHealth',
                key: '/health/ready',
                method: 'GET',
                controller: 'DefaultHealthController',
                operation: 'getReadiness',
                help: {
                    requestType: 'public',
                    message: 'Low-disclosure traffic readiness probe. Returns only UP or DOWN.',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/health/ready'
                }
            },
            getReadinessDetails: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.health.readiness.view',
                apiExposure: 'operationalHealth',
                key: '/health/ready/details',
                method: 'GET',
                controller: 'DefaultHealthController',
                operation: 'getReadinessDetails',
                help: {
                    requestType: 'secured',
                    message: 'Returns sanitized runtime and dependency readiness details without secrets or provider endpoints.',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/health/ready/details'
                }
            }
        },

        contentPacks: {
            status: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.contentPack.view',
                apiExposure: 'dataImport',
                key: '/content-packs/:packCode',
                method: 'GET',
                controller: 'DefaultContentPackController',
                operation: 'getStatus'
            },
            importPack: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'import.contentPack.run',
                apiExposure: 'dataImport',
                key: '/content-packs/:packCode/imports',
                method: 'POST',
                controller: 'DefaultContentPackController',
                operation: 'importPack'
            }
        },

        changeLogLevel: {
            changeLevelPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.log.level.update',
                apiExposure: 'logManagement',
                key: '/log/level',
                method: 'POST',
                controller: 'DefaultLogController',
                operation: 'changeLogLevel',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
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
                apiExposure: 'runtimeConfiguration',
                key: '/config',
                method: 'POST',
                controller: 'DefaultConfigurationController',
                operation: 'changeConfig',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
                apiExposure: 'runtimeConfiguration',
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
            getInternalOpenApiContract: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'serviceRegistry',
                key: '/contract/openapi/internal',
                method: 'GET',
                controller: 'DefaultApiContractController',
                operation: 'getOpenApiContract',
                help: {
                    requestType: 'internalService',
                    message: 'Returns the effective runtime OpenAPI contract to authenticated service-registry consumers.',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/v0/contract/openapi/internal'
                }
            },
            getOpenApiContract: {
                secured: false,
                accessGroups: ['userGroup'],
                permission: 'system.contract.openapi.view',
                apiExposure: 'openApiContract',
                publicAccess: true,
                key: '/contract/openapi',
                method: 'GET',
                controller: 'DefaultApiContractController',
                operation: 'getOpenApiContract',
                help: {
                    requestType: 'publicDocumentation',
                    message: 'Returns the active runtime OpenAPI contract when openApiContract exposure is enabled. Disable the category in production environments that should not expose API documentation.',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/v0/contract/openapi'
                }
            },
            getSwaggerUi: {
                secured: false,
                accessGroups: ['userGroup'],
                permission: 'system.contract.swagger.view',
                apiExposure: 'openApiContract',
                publicAccess: true,
                key: '/contract/swagger',
                method: 'GET',
                controller: 'DefaultApiContractController',
                operation: 'getSwaggerUi',
                responseHandler: 'textResponseHandler',
                help: {
                    requestType: 'publicDocumentation',
                    message: 'Opens interactive Swagger UI backed by the active runtime OpenAPI contract when openApiContract exposure is enabled.',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/v0/contract/swagger'
                }
            },
            getSwaggerAsset: {
                secured: false,
                accessGroups: ['userGroup'],
                permission: 'system.contract.swagger.view',
                apiExposure: 'openApiContract',
                publicAccess: true,
                key: '/contract/swagger/asset/:assetName',
                method: 'GET',
                controller: 'DefaultApiContractController',
                operation: 'getSwaggerAsset',
                responseHandler: 'textResponseHandler',
                help: {
                    requestType: 'publicDocumentation',
                    message: 'Serves approved local Swagger UI assets only when openApiContract exposure is enabled.',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/v0/contract/swagger/asset/swagger-ui.css'
                }
            }
        },

        updateAllIndexes: {
            updateAllModulesIndexes: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.schema.index.rebuild',
                apiExposure: 'schemaMaintenance',
                key: '/schema/indexes/all',
                method: 'POST',
                controller: 'DefaultSchemaIndexController',
                operation: 'updateModulesIndexes',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/schema/indexes/all'
                }
            },
        },

        /* ------------------------------- */
        testRunner: {
            runAllUTest: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.test.unit.run',
                apiExposure: 'testExecution',
                key: '/test/runUTest',
                method: 'POST',
                controller: 'TestExecutionController',
                operation: 'runUTest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/test/runUTest',
                }
            },
            runAllNTest: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'system.test.nodics.run',
                apiExposure: 'testExecution',
                key: '/test/runNTest',
                method: 'POST',
                controller: 'TestExecutionController',
                operation: 'runNTest',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/system/test/runNTest',
                }
            }
        },
    }
};
