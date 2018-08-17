/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    backgroundAuthModules: {
        nems: {
            enterpriseCode: 'default',
            loginId: 'admin',
            password: 'nodics'
        }
    },

    eventFetchSize: 100,
    publishEventOnNode: '0',
    server: {
        nems: {
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
        nems: {
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
    },

    /*database: {
        nems: {
            databaseType: 'mongodb', //for Cassandra use 'cassandra'
            mongodb: {
                master: {
                    URI: 'mongodb://localhost:27017',
                    databaseName: 'nemsMaster',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5
                    }
                },
                test: {
                    URI: 'mongodb://localhost:27017',
                    databaseName: 'nemsTest',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5
                    }
                }
            }
        }
    },*/

};