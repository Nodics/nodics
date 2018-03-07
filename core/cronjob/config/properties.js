/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cronjob: {
        runOnStartup: false,
        waitTime: 100,
        activeJobsQuery: {
            $and: [
                { "triggers.isActive": true },
                { "active.start": { $lt: new Date() } },
                {
                    $or: [
                        { "active.end": { $gte: new Date() } },
                        { "active.end": { $exists: false } }
                    ]
                }
            ]
        }
    },

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