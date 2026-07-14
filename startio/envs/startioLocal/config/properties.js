/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
    // Local sample credentials are explicit project-layer compatibility values.
    // Deployments must override both values through governed secret configuration.
    defaultAuthDetail: {
        apiKey: process.env.NODICS_BOOTSTRAP_API_KEY || '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    bootstrapIdentity: {
        adminPassword: process.env.NODICS_BOOTSTRAP_ADMIN_PASSWORD || 'startio-local-admin-change-me',
        servicePassword: process.env.NODICS_BOOTSTRAP_SERVICE_PASSWORD || 'startio-local-service-change-me',
        serviceApiKey: process.env.NODICS_BOOTSTRAP_API_KEY || '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    authSecurity: {
        jwt: {
            secret: process.env.NODICS_JWT_SECRET || 'startio-local-only-jwt-secret-change-before-deployment'
        },
        compatibility: {
            allowInsecureDevelopmentSecret: true
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
            consolidatedServer: 'startioLocalServer',
            modularServers: [
                'startioLocalProfileServer',
                'startioLocalNemsServer',
                'startioLocalDeapServer',
                'startioLocalCronServer',
                'startioLocalCmsServer',
                'startioLocalWorkflowServer'
            ],
            communicationChecks: [
                {
                    server: 'startioLocalProfileServer',
                    moduleName: 'profile',
                    path: '/v0/ping?help'
                },
                {
                    server: 'startioLocalNemsServer',
                    moduleName: 'nems',
                    path: '/v0/ping?help'
                },
                {
                    server: 'startioLocalCronServer',
                    moduleName: 'cronjob',
                    path: '/v0/ping?help'
                },
                {
                    server: 'startioLocalWorkflowServer',
                    moduleName: 'workflow',
                    path: '/v0/ping?help'
                }
            ]
        }
    }
};
