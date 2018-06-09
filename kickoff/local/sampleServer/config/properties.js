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
        groups: ['core', 'ems'], // Group 'framework' will be included automatically
        modules: [
            'sampleServer',
            'storefront',
            'kickoff',
            'local'
        ]
    },
    log: {
        level: 'debug'
    },

    server: {
        /*storefront: {
            options: {
                contextRoot: 'nodics',
                connectToDefault: false
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3011,

                httpsHost: 'localhost',
                httpsPort: 3012
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3011,

                httpsHost: 'localhost',
                httpsPort: 3012
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3011,

                    httpsHost: 'localhost',
                    httpsPort: 3012
                }
            }
        }*/
    },
};