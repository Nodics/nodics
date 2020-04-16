/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    dynamo: {
        classOperations: {
            getClass: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/class/get/:className',
                method: 'GET',
                controller: 'DefaultClassConfigurationController',
                operation: 'getClass',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/dynamo/class/get/:className',
                }
            },
            getSnapshot: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/class/snapshot/:type/:className',
                method: 'GET',
                controller: 'DefaultClassConfigurationController',
                operation: 'getSnapshot',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/dynamo/class/snapshot/:type/:className',
                }
            },
            updateClass: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/class/update/:type/:className',
                method: 'PUT',
                controller: 'DefaultClassConfigurationController',
                operation: 'updateClass',
                bodyParserHandler: 'textBodyParserHandler',
                help: {
                    requestType: 'secured',
                    contentType: 'PLAIN|TEXT',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/dynamo/class/update/:type/:className',
                    body: 'definition of JavaScript litteral object'
                }
            },

            executeClass: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/class/execute',
                method: 'POST',
                controller: 'DefaultClassConfigurationController',
                operation: 'executeClass',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
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