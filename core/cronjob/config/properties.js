/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    startJobsOnStartup: false,
    cronJobStartWaitInterval: 1000,
    server: {
        cronjob: {
            abstractServer: {
                httpHost: 'localhost',
                httpPort: '3002',

                httpsHost: 'localhost',
                httpsPort: '3002'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3002,

                httpsHost: 'localhost',
                httpsPort: 3003

            }
            /*
                httpServer: 'localhost',
                httpPort: 3002,

                httpsServer: 'localhost',
                httpsPort: 3003,
            */
        }
    },

    cache: {
        cronjob: {
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
        }
    }
};