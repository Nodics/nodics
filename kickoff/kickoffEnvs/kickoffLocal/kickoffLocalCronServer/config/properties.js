/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activeModules: {
        updateGroups: true,
        //groups: ['core', 'ems'], // Group 'framework' will be included automatically
        modules: [
            'cronjob',
            'kickoffLocalCronServer',
            'kickoffLocal'
        ]
    },
    log: {
        level: 'debug'
    },

    server: {
        default: {
            options: {
                contextRoot: 'nodics'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3002,

                httpsHost: 'localhost',
                httpsPort: 3003
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3002,

                httpsHost: 'localhost',
                httpsPort: 3003
            },
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3002,

                    httpsHost: 'localhost',
                    httpsPort: 3003
                }
            }
        },

        // This configuration required to load enterprise, tenants and all internal communication
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
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                }
            }
        },

        // This configuration required to push any event needs to be send for other module
        nems: {
            options: {
                contextRoot: 'nodics'
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
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3004,

                    httpsHost: 'localhost',
                    httpsPort: 3005
                }
            }
        }
    }
};