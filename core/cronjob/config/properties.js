/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    backgroundAuthModules: {
        cronjob: {
            enterpriseCode: 'default',
            loginId: 'admin',
            password: 'nodics'
        }
    },

    cronjob: {
        runOnStartup: false,
        waitTime: 100,
        activeJobsQuery: {
            $and: [{
                "triggers.isActive": true
            },
            {
                "active.start": {
                    $lt: new Date()
                }
            },
            {
                $or: [{
                    "active.end": {
                        $gte: new Date()
                    }
                },
                {
                    "active.end": {
                        $exists: false
                    }
                }
                ]
            }
            ]
        }
    },
    server: {
        cronjob: {
            options: {
                contextRoot: 'nodics',
                connectToDefault: false
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
            local: {
                handler: 'DefaultLocalCacheService',
                options: {
                    stdTTL: 100,
                    checkperiod: 10,
                    errorOnMissing: false,
                    useClones: true
                }
            },
            redis: {
                handler: 'DefaultRedisCacheService',
                options: {
                    host: 'localhost',
                    port: 6379
                }
            }
        }
    }
};