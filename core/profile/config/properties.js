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
    authorizationModuleName: 'profile',
    authTokenLife: 60 * 5,
    server: {
        profile: {
            server: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: '3000',

                httpsHost: 'localhost',
                httpsPort: '3001'
            },
            //Clusters information is optional and will be managed for Backoffice application
            cluster0: {
                httpHost: 'localhost',
                httpPort: '3000',

                httpsHost: 'localhost',
                httpsPort: '3001'
            }
        }
    },

    cache: {
        authTokenTTL: 60 * 60,
        authToken: {
            stdTTL: 60 * 60,
            checkperiod: 180,
            errorOnMissing: false,
            useClones: true
        },
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
            localOptions: {
                stdTTL: 100,
                checkperiod: 10,
                errorOnMissing: false,
                useClones: true
            },
            redisOptions: {
                host: 'localhost',
                port: 6379
            }
        },
        itemLevelCache: {
            enterprise: {
                enabled: true,
                ttl: 100
            }
        }
    }
};