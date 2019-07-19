/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    nodeId: 2,
    server: {
        default: {
            options: {
                contextRoot: 'nodics'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3014,

                httpsHost: 'localhost',
                httpsPort: 3015
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3010,

                httpsHost: 'localhost',
                httpsPort: 3011
            },
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3010,

                    httpsHost: 'localhost',
                    httpsPort: 3011
                },
                1: {
                    httpHost: 'localhost',
                    httpPort: 3012,

                    httpsHost: 'localhost',
                    httpsPort: 3013
                },
                2: {
                    httpHost: 'localhost',
                    httpPort: 3014,

                    httpsHost: 'localhost',
                    httpsPort: 3015
                },
                3: {
                    httpHost: 'localhost',
                    httpPort: 3016,

                    httpsHost: 'localhost',
                    httpsPort: 3017
                }
            }
        }
    }
};