/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    webRootDirName: 'web',
    webDistDirName: 'lib',
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
    requestHandler: {
        jsonRequestHandler: 'DefaultJsonRequestHandlerService',
        textRequestHandler: 'DefaultTextRequestHandlerService'
    },

    responseHandler: {
        jsonResponseHandler: 'DefaultJsonResponseHandlerService',
        fileDownloadResponseHandler: 'DefaultFileDownloadResponseHandlerService'
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