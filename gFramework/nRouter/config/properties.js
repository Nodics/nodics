/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/config/properties
 * @description Default router configuration for route initialization order, body/response handlers, authorization, and server endpoints.
 * @layer config
 * @owner nRouter
 * @override Project, environment, server, or node modules may override router properties through layered configuration without changing framework defaults.
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
    bodyParserHandler: {
        jsonBodyParserHandler: 'DefaultJsonBodyParserHandlerService',
        textBodyParserHandler: 'DefaultTextBodyParserHandlerService'
    },

    responseHandler: {
        jsonResponseHandler: 'DefaultJsonResponseHandlerService',
        textResponseHandler: 'DefaultTextResponseHandlerService',
        fileDownloadResponseHandler: 'DefaultFileDownloadResponseHandlerService'
    },
    routeActionAuthorization: {
        enabled: true,
        strict: true,
        superPermissions: ['*', 'runtime.config.*'],
        groupPermissions: {}
    },
    server: {
        options: {
            contextRoot: 'nodics'
        },
        default: {
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
            },//Clusters information is optional and will be managed for Backoffice application
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                }
            }
        }
    }
};
