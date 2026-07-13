/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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

    Copyright (c) 2017 Nodics All rights reserved.

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
                    disabledReason: 'The bundled Hazelcast adapter is a placeholder and must not be selected until a real distributed implementation overrides it',
                    connectionHandler: 'DefaultHazelcastCacheEngineService',
                    cacheHandler: 'DefaultHazelcastCacheService',
                    distributed: false,
                    atomicConsume: false,
                    capabilities: {
                        distributed: false,
                        atomicConsume: false,
                        ttl: false,
                        nonExpiringTtl: false,
                        prefixFlush: false,
                        keyFlush: false,
                        serialization: 'unsupported'
                    },
                    ttl: 100,
                    dbIndex: 0,
                    options: {
                        host: 'localhost',
                        port: 6379
                    }
                }
            }
        }
    },

    defaultErrorCodes: {
        CacheError: 'ERR_CACHE_00000'
    }
};
