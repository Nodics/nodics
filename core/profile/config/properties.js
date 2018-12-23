/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    attemptsToLockAccount: 5,
    encryptSaltLength: 10,
    passwordLengthLimit: 25,
    forceAPIKeyGenerate: false,
    server: {
        profile: {
            options: {
                contextRoot: 'nodics'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                }
            }
        }
    },

    cache: {
        profile: {
            apiCache: {
                enabled: true,
                fallback: true,
                engine: 'local'
            },
            itemCache: {
                enabled: true,
                fallback: true,
                engine: 'local'
            },
            authCache: {
                enabled: true,
                fallback: true,
                engine: 'local'
            },
            local: {
                handler: 'DefaultLocalCacheService',
                ttl: 100,
                options: {
                    stdTTL: 100,
                    checkperiod: 10,
                    errorOnMissing: false,
                    useClones: true
                }
            },
            redis: {
                handler: 'DefaultRedisCacheService',
                ttl: 100,
                options: {
                    host: 'localhost',
                    port: 6379
                }
            },
            hazelcast: {
                handler: 'DefaultRedisCacheService',
                ttl: 100,
                options: {
                    host: 'localhost',
                    port: 6379
                }
            }
        },
        itemLevelCache: {
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
    },
    profile: {
        defaultAuthDetail: {
            enterpriseCode: 'default',
            tenant: 'default',
            loginId: 'apiAdmin'
        }
    }
};