/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    // Local-only sample credentials keep the startio developer environment runnable.
    // Real deployments must override these values through governed secret configuration.
    defaultAuthDetail: {
        apiKey: process.env.NODICS_BOOTSTRAP_API_KEY || '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    bootstrapIdentity: {
        source: 'localSample',
        adminPassword: process.env.NODICS_BOOTSTRAP_ADMIN_PASSWORD || 'startio-local-admin-change-me',
        servicePassword: process.env.NODICS_BOOTSTRAP_SERVICE_PASSWORD || 'startio-local-service-change-me',
        serviceApiKey: process.env.NODICS_BOOTSTRAP_API_KEY || '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    apiExposure: {
        categories: {
            serviceRegistry: {
                enabled: true
            },
            fileAccess: {
                enabled: true
            },
            dataImport: {
                enabled: true
            },
            dataExport: {
                enabled: true
            },
            logManagement: {
                enabled: true
            },
            testExecution: {
                enabled: true
            },
            dynamicClass: {
                enabled: true
            }
        }
    },
    httpHardening: {
        cors: {
            enabled: true,
            allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://127.0.0.1:5173'],
            allowCredentials: true
        },
        rateLimit: {
            enabled: true,
            windowMs: 60000,
            max: 2000
        }
    },
    authSecurity: {
        jwt: {
            secret: process.env.NODICS_JWT_SECRET || 'startio-local-only-jwt-secret-change-before-deployment'
        },
        compatibility: {
            allowInsecureDevelopmentSecret: true,
            allowLocalBootstrapIdentity: true
        },
        internalToken: {
            crossTenantGroups: ['userGroup']
        },
        apiKey: {
            requireScopes: false,
            allowLegacyHumanPrincipals: true,
            allowLegacyPlaintextLookup: true,
            pepper: process.env.NODICS_API_KEY_PEPPER || 'startio-local-api-key-pepper-change-before-deployment'
        },
        securityStamp: {
            failClosed: false,
            allowMissingStamp: true
        },
        refreshToken: {
            requireDistributedCache: false
        }
    },
    cache: {
        enabled: true,
        default: {
            channels: {
                router: {
                    engine: 'redis'
                },
                schema: {
                    engine: 'redis'
                }
            },
            engines: {
                redis: {
                    enabled: true,
                    options: {
                        url: process.env.NODICS_CACHE_REDIS_URL || 'redis://127.0.0.1:6379'
                    }
                }
            }
        }
    },
    test: {
        runtimeTopology: {
            monoServer: 'monoServer',
            requiredConsolidatedModules: [
                'profile', 'nems', 'cronjob', 'workflow', 'cms', 'wcms',
                'dataConsumer', 'dataProcessor', 'dataPublisher', 'backoffice'
            ],
            modularServers: [
                'profileServer',
                'nemsServer',
                'deapServer',
                'cronServer',
                'cmsStagedServer',
                'cmsOnlineServer',
                'workflowServer',
                'backofficeServer'
            ],
            requiredModularModules: {
                profileServer: ['profile'],
                nemsServer: ['nems'],
                deapServer: ['dataConsumer', 'dataProcessor', 'dataPublisher'],
                cronServer: ['cronjob'],
                cmsStagedServer: ['cms', 'wcms', 'workflow', 'publish'],
                cmsOnlineServer: ['cms'],
                workflowServer: ['workflow'],
                backofficeServer: ['backoffice']
            },
            communicationChecks: [
                {
                    server: 'profileServer',
                    moduleName: 'profile',
                    path: '/v0/ping?help'
                },
                {
                    server: 'nemsServer',
                    moduleName: 'nems',
                    path: '/v0/ping?help'
                },
                {
                    server: 'cronServer',
                    moduleName: 'cronjob',
                    path: '/v0/ping?help'
                },
                {
                    server: 'cmsOnlineServer',
                    moduleName: 'cms',
                    path: '/v0/ping?help',
                    topologies: ['modular']
                },
                {
                    server: 'workflowServer',
                    moduleName: 'workflow',
                    path: '/v0/ping?help'
                },
                {
                    server: 'backofficeServer',
                    moduleName: 'backoffice',
                    path: '/v0/ping?help',
                    topologies: ['modular']
                }
            ]
        }
    }
};
