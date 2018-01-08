/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    eventFetchSize: 100,
    server: {
        nems: {
            abstractServer: {
                httpHost: 'localhost',
                httpPort: '3006',

                httpsHost: 'localhost',
                httpsPort: '3007'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3006,

                httpsHost: 'localhost',
                httpsPort: 3007
            }
        }
    }

};