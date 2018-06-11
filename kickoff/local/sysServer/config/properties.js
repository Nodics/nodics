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
            'system',
            'sysServer',
            'kickoff',
            'local'
        ]
    },
    log: {
        level: 'debug'
    },

    server: {
        default: {
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
        },

        /*storefront: {
            options: {
                contextRoot: 'nodics',
                connectToDefault: false
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
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3002,

                    httpsHost: 'localhost',
                    httpsPort: 3003
                }
            }
        }*/
    }
};