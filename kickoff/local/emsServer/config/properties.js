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
            'emsClient',
            'emsServer',
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
                httpPort: 3006,

                httpsHost: 'localhost',
                httpsPort: 3007
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3006,

                httpsHost: 'localhost',
                httpsPort: 3007
            },//Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3006,

                    httpsHost: 'localhost',
                    httpsPort: 3007
                }
            }
        },

        /*emsClient: {
            options: {
                contextRoot: 'nodics',
                connectToDefault: false
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3018,

                httpsHost: 'localhost',
                httpsPort: 3019
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3018,

                httpsHost: 'localhost',
                httpsPort: 3019
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                httpPort: 3018,

                httpsHost: 'localhost',
                httpsPort: 3019
                }
            }
        }*/
    }
};