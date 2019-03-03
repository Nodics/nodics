/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    cache: {
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
                    handler: 'DefaultLocalCacheEngineService',
                    ttl: 100,
                    options: {
                        stdTTL: 100,
                        checkperiod: 10,
                        errorOnMissing: false,
                        useClones: true
                    }
                },
                redis: {
                    handler: 'DefaultRedisCacheEngineService',
                    ttl: 100,
                    options: {
                        host: 'localhost',
                        port: 6379
                    }
                },
                hazelcast: {
                    handler: 'defaultHazelcastCacheEngineService',
                    ttl: 100,
                    dbIndex: 0,
                    options: {
                        host: 'localhost',
                        port: 6379
                    }
                }
            }
        },
        profile: {
            channels: {
                auth: {
                    defaultTTL: 60 * 60,
                    enabled: true,
                    fallback: true,
                    engine: 'local',
                    events: {
                        expired: 'DefaultAuthTokenInvalidationService.publishTokenExpiredEvent',
                        del: 'DefaultAuthTokenInvalidationService.publishTokenDeletedEvent',
                        flushed: 'DefaultAuthTokenInvalidationService.publishTokenFlushedEvent'
                    }
                },
            }
        },
        schemaLevelCache: {
            enterprise: {
                enabled: true,
                ttl: 100
            }
        },
        routerLevelCache: {
            address: {
                get: {
                    enabled: true,
                    ttl: 50
                },
                post: {
                    enabled: true,
                    ttl: 70
                }
            }
        }

    }
};