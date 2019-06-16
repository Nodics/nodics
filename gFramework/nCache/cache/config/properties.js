/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    cache: {
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
                    connectionHandler: 'DefaultLocalCacheEngineService',
                    cacheHandler: 'DefaultLocalCacheService',
                    ttl: 100,
                    options: {
                        stdTTL: 100,
                        checkperiod: 10,
                        errorOnMissing: false,
                        useClones: true
                    }
                },
                redis: {
                    connectionHandler: 'DefaultRedisCacheEngineService',
                    cacheHandler: 'DefaultRedisCacheService',
                    ttl: 100,
                    options: {
                        host: 'localhost',
                        port: 6379
                    }
                },
                hazelcast: {
                    connectionHandler: 'DefaultHazelcastCacheEngineService',
                    cacheHandler: 'DefaultHazelcastCacheService',
                    ttl: 100,
                    dbIndex: 0,
                    options: {
                        host: 'localhost',
                        port: 6379
                    }
                }
            }
        }
    }
};