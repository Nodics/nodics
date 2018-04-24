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
                httpPort: 3006,

                httpsHost: 'localhost',
                httpsPort: 3007
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3006,

                httpsHost: 'localhost',
                httpsPort: 3007
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3006,

                    httpsHost: 'localhost',
                    httpsPort: 3007
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