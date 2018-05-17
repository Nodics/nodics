/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    /* database: {
         system: {
             databaseType: 'mongodb', //for Cassandra use 'cassandra'
             mongodb: {
                 master: {
                     URI: 'mongodb://localhost:27017/systemMaster',
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
                     URI: 'mongodb://localhost:27017/systemTest',
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

    server: {
        system: {
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
        }
    }
};