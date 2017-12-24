/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    routerInitFunction: [
        'initProperties',
        'initSession',
        'initLogger',
        'initCache',
        'initBodyParser',
        'initHeaders',
        'initErrorRoutes',
        'initExtras'
    ],

    server: {
        contextRoot: 'nodics',
        runAsSingleModule: true,
        default: {
            abstractServer: {
                httpHost: 'localhost',
                httpPort: '3000',

                httpsHost: 'localhost',
                httpsPort: '3000'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            }
            /*
                httpServer: 'localhost',
                httpPort: 3000,

                httpsServer: 'localhost',
                httpsPort: 3001
            */
        }
    }
};