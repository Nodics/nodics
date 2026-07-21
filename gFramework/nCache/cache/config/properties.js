/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCache/cache/config/Properties
 * @description Defines layered cache channels, adapters, capability metadata, TTL defaults, and schema/router/auth channel mappings.
 * @layer config
 * @owner nCache/cache
 * @override Project, environment, server, and node modules may replace engines and channels while preserving the declared adapter capability contract.
 */
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    cache: {
        enabled: true,
        diagnostics: {
            enabled: true,
            includeTenant: true
        },
        benchmark: {
            iterations: 12,
            simulatedControllerDelayMs: 4,
            simulatedDaoDelayMs: 4
        },
        cacheability: {
            enabled: true,
            maxPayloadBytes: 262144,
            allowSensitiveFields: false,
            skipEmptyResults: false,
            skipBinaryPayloads: true,
            logSkippedReason: true,
            handlerFailureMode: 'failClosed',
            policyHandlers: [],
            sensitiveFieldNames: [
                'password',
                'token',
                'accessToken',
                'refreshToken',
                'authorization',
                'apiKey',
                'secret',
                'credential'
            ]
        },
        invalidation: {
            crossNode: true,
            eventName: 'cacheInvalidation'
        },
        schemaCacheChannelNameMapping: {
            //enterprise: 'cacheChannelName'
        },
        routerCacheChannelNameMapping: {
            //routerName: 'cacheChannelName'
        },
        authCacheChannelNameMapping: {
            //tenantName: 'cacheChannelName'
        },
        default: {
            options: {

            },
            channels: {
                router: {
                    enabled: true,
                    fallback: true,
                    engine: 'local'
                },
                schema: {
                    enabled: true,
                    fallback: true,
                    engine: 'local'
                }
            },
            engines: {
                local: {
                    enabled: true,
                    contractVersion: 1,
                    connectionHandler: 'DefaultLocalCacheEngineService',
                    cacheHandler: 'DefaultLocalCacheService',
                    distributed: false,
                    atomicConsume: true,
                    capabilities: {
                        distributed: false,
                        atomicConsume: true,
                        ttl: true,
                        nonExpiringTtl: true,
                        prefixFlush: true,
                        keyFlush: true,
                        serialization: 'clone'
                    },
                    ttl: 100,
                    options: {
                        stdTTL: 100,
                        checkperiod: 10,
                        errorOnMissing: false,
                        useClones: true
                    }
                },
                redis: {
                    enabled: false,
                    contractVersion: 1,
                    connectionHandler: 'DefaultRedisCacheEngineService',
                    cacheHandler: 'DefaultRedisCacheService',
                    distributed: true,
                    atomicConsume: true,
                    capabilities: {
                        distributed: true,
                        atomicConsume: true,
                        ttl: true,
                        nonExpiringTtl: true,
                        prefixFlush: true,
                        keyFlush: true,
                        serialization: 'json'
                    },
                    ttl: 100,
                    options: {
                        host: 'localhost',
                        port: 6379
                    }
                },
                hazelcast: {
                    enabled: false,
                    contractVersion: 1,
                    connectionHandler: 'DefaultHazelcastCacheEngineService',
                    cacheHandler: 'DefaultHazelcastCacheService',
                    distributed: true,
                    atomicConsume: true,
                    capabilities: {
                        distributed: true,
                        atomicConsume: true,
                        ttl: true,
                        nonExpiringTtl: true,
                        prefixFlush: true,
                        keyFlush: true,
                        serialization: 'json'
                    },
                    ttl: 100,
                    dbIndex: 0,
                    options: {
                        clusterName: 'dev',
                        clusterMembers: ['127.0.0.1:5701'],
                        connectionTimeoutMs: 5000,
                        mapNamePrefix: 'nodics'
                    }
                }
            }
        }
    },

    defaultErrorCodes: {
        CacheError: 'ERR_CACHE_00000'
    }
};
