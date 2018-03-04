/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    encryptSaltLength: 10,
    authorizationModuleName: 'profile',
    authTokenLife: 60 * 5,
    server: {
        profile: {
            abstractServer: {
                httpHost: 'localhost',
                httpPort: '3004',

                httpsHost: 'localhost',
                httpsPort: '3005'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3004,

                httpsHost: 'localhost',
                httpsPort: 3005
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