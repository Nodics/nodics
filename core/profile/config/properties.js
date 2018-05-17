/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    /*database: {
        profile: {
            databaseType: 'mongodb', //for Cassandra use 'cassandra'
            mongodb: {
                master: {
                    URI: 'mongodb://localhost:27017/profileMaster',
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
                    URI: 'mongodb://localhost:27017/profileTest',
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

    attemptsToLockAccount: 5,
    encryptSaltLength: 10,
    authorizationModuleName: 'profile',
    server: {
        profile: {
            options: {
                contextRoot: 'nodics',
                connectToDefault: false
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3004,

                httpsHost: 'localhost',
                httpsPort: 3005
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3004,

                httpsHost: 'localhost',
                httpsPort: 3005
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3004,

                    httpsHost: 'localhost',
                    httpsPort: 3005
                }
            }
        }
    },

    cache: {
        makeAuthTokenLocal: true,
        authTokenTTL: 60 * 60,
        authToken: {
            stdTTL: 60 * 60,
            checkperiod: 1,
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