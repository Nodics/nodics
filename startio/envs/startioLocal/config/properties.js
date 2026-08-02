/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module startio/envs/startioLocal/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    // Local uses concise logs by default. Individual servers override this
    // only when their acceptance workflow requires debug detail.
    log: {
        level: 'info'
    },
    // Local-only sample credentials keep the startio developer environment runnable.
    // Real deployments must override these values through governed secret configuration.
    defaultAuthDetail: {
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    bootstrapIdentity: {
        source: 'localSample',
        adminPassword: 'adminPassword',
        servicePassword: 'servicePassword',
        serviceApiKey: '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    apiExposure: {
        categories: {
            serviceRegistry: {
                enabled: true
            },
            aiAssistant: {
                enabled: true
            },
            mediaManagement: {
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
    data: {
        contentPacks: {
            enabled: true
        },
        dataReleases: {
            types: {
                sample: {
                    enabled: true,
                    operatorExecution: true
                }
            }
        }
    },
    // Local runtime media bytes are deployment state for the active server.
    // nMedia owns provider definitions, folder policy, URL delivery, and key
    // strategy defaults; this environment only makes the local storage root
    // explicit so uploads land below each running server path.
    media: {
        storage: {
            providers: {
                local: {
                    basePath: 'temp/media'
                }
            }
        }
    },
    httpHardening: {
        cors: {
            enabled: true,
            allowedOrigins: [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3100',
                'http://127.0.0.1:3100',
                'http://localhost:5173',
                'http://127.0.0.1:5173'
            ],
            allowCredentials: true
        },
        rateLimit: {
            enabled: true,
            windowMs: 60000,
            max: 2000
        }
    },
    profileBrowserSession: {
        enabled: true,
        secure: false
    },
    authSecurity: {
        jwt: {
            secret: 'startio-local-only-jwt-secret-change-before-deployment'
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
            pepper: 'startio-local-api-key-pepper-change-before-deployment'
        },
        securityStamp: {
            failClosed: false,
            allowMissingStamp: true
        },
        refreshToken: {
            requireDistributedCache: false
        }
    },
    // Local acceptance enables governed Assistant tools. Reusable Startio
    // application defaults and provider definitions remain module-owned.
    aiAssistant: {
        tools: {
            enabled: true
        }
    },
    cache: {
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
                        url: 'redis://127.0.0.1:6379'
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
