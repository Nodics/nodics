/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /*database: {
            cronjob: {
            databaseType: 'mongodb', //for Cassandra use 'cassandra'
            mongodb: {
                master: {
                    URI: 'mongodb://localhost:27017/cronJobMaster',
                    options: {
                        db: {
                            native_parser: true
                        },
                        server: {
                            poolSize: 5
                        }
                    }
                },
                test: {
                    URI: 'mongodb://localhost:27017/cronJobTest',
                    options: {
                        db: {
                            native_parser: true
                        },
                        server: {
                            poolSize: 5
                        }
                    }
                }
            }
        }
    },*/

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
                httpPort: 3008,

                httpsHost: 'localhost',
                httpsPort: 3009
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3008,

                httpsHost: 'localhost',
                httpsPort: 3009
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3008,

                    httpsHost: 'localhost',
                    httpsPort: 3009
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