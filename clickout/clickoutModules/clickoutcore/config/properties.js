/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profileModuleReconnectTimeout: 5000,

    database: {
        default: {
            mongodb: {
                master: {
                    databaseName: 'clickoutMaster',
                },
                test: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'clickoutTest',
                }
            }
        }
    }
};