/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/router/routers
 * @description Defines nDynamo route registration and HTTP exposure metadata.
 * @layer router
 * @owner nDynamo
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    dynamo: {
        classOperations: {
            getClass: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'dynamo.class.view',
                apiExposure: 'dynamicClass',
                key: '/class/get/:className',
                method: 'GET',
                controller: 'DefaultClassConfigurationController',
                operation: 'getClass',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/dynamo/class/get/:className',
                }
            },
            getSnapshot: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'dynamo.class.snapshot.view',
                apiExposure: 'dynamicClass',
                key: '/class/snapshot/:type/:className',
                method: 'GET',
                controller: 'DefaultClassConfigurationController',
                operation: 'getSnapshot',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/dynamo/class/snapshot/:type/:className',
                }
            },
            updateClass: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'dynamo.class.update',
                apiExposure: 'dynamicClass',
                key: '/class/update/:type/:className',
                method: 'PUT',
                controller: 'DefaultClassConfigurationController',
                operation: 'updateClass',
                bodyParserHandler: 'textBodyParserHandler',
                help: {
                    requestType: 'secured',
                    contentType: 'PLAIN|TEXT',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'PUT',
                    url: 'http://host:port/nodics/dynamo/class/update/:type/:className',
                    body: 'definition of JavaScript litteral object'
                }
            },

            executeClass: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'dynamo.class.execute',
                apiExposure: 'dynamicClass',
                key: '/class/execute',
                method: 'POST',
                controller: 'DefaultClassConfigurationController',
                operation: 'executeClass',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/dynamo/class/execute',
                    body: {
                        className: 'Name of the class',
                        type: 'Type like SERVICE, FACADE, CONTROLLER, UTILS',
                        operationName: 'Name of operation to execute',
                        isReturnPromise: 'true if operation return Promise',
                        params: 'Array of values to be passed in function to execute'
                    }
                }
            }
        }
    }
};
