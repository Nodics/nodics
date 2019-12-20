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
            addClass: {
                secured: true,
                key: '/class/add/:className/:type',
                method: 'PUT',
                controller: 'DefaultClassConfigurationController',
                operation: 'addClass',
                bodyParserHandler: 'textBodyParserHandler',
                help: {
                    requestType: 'secured',
                    contentType: 'PLAIN|TEXT',
                    message: 'authToken need to set within header',
                    method: 'PUT',
                    url: 'http://host:port/nodics/config/class/add/:className/:type',
                    body: {
                        className: 'Name of the class',
                        type: 'Type like SERVICE, FACADE, CONTROLLER, UTILS',
                        body: 'definition of JavaScript litteral object'
                    }
                }
            },
            updateClass: {
                secured: true,
                key: '/class/update',
                method: 'PATCH',
                controller: 'DefaultClassConfigurationController',
                operation: 'updateClass',
                bodyParserHandler: 'textBodyParserHandler',
                help: {
                    requestType: 'secured',
                    contentType: 'PLAIN|TEXT',
                    message: 'authToken need to set within header',
                    method: 'PATCH',
                    url: 'http://host:port/nodics/config/class/add',
                    body: {
                        className: 'Name of the class',
                        type: 'Type like SERVICE, FACADE, CONTROLLER, UTILS',
                        body: 'definition of JavaScript litteral object'
                    }
                }
            },
            executeClass: {
                secured: true,
                key: '/class/execute',
                method: 'POST',
                controller: 'DefaultClassConfigurationController',
                operation: 'executeClass',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/config/class/add',
                    body: {
                        className: 'Name of the class',
                        type: 'Type like SERVICE, FACADE, CONTROLLER, UTILS',
                        operationName: 'Name of operation to execute',
                        isReturnPromise: 'true if operation return Promise'
                    }
                }
            },
            // updateClass: {
            //     secured: true,
            //     key: '/class/update',
            //     method: 'POST',
            //     handler: 'DefaultClassConfigurationController',
            //     operation: 'updateClass',
            //     help: {
            //         requestType: 'secured',
            //         message: 'authToken need to set within header',
            //         method: 'POST',
            //         url: 'http://host:port/nodics/config/class/update',
            //         body: {
            //             name: 'Name of the class',
            //             upsert: 'true/false',
            //             definition: 'definition of JavaScript litteral object'
            //         }
            //     }
            // },
            // removeClass: {
            //     secured: true,
            //     key: '/class/remove',
            //     method: 'POST',
            //     handler: 'DefaultClassConfigurationController',
            //     operation: 'removeClass',
            //     help: {
            //         requestType: 'secured',
            //         message: 'authToken need to set within header',
            //         method: 'POST',
            //         url: 'http://host:port/nodics/config/class/update',
            //         body: {
            //             name: 'Name of the class',
            //             operation: 'Name of operation to delete, if blank, whole class will be deleted',
            //             definition: 'definition of JavaScript litteral object'
            //         }
            //     }
            // }
        },
        // routerOperations: {
        //     addRouter: {
        //         secured: true,
        //         key: '/router/add',
        //         method: 'POST',
        //         handler: 'DefaultRouterConfigurationController',
        //         operation: 'addRouter',
        //         help: {
        //             requestType: 'secured',
        //             message: 'authToken need to set within header',
        //             method: 'POST',
        //             url: 'http://host:port/nodics/config/router/add',
        //             body: {
        //                 name: 'Name of the router',
        //                 definition: 'definition of JavaScript litteral object'
        //             }
        //         }
        //     },
        //     updateRouter: {
        //         secured: true,
        //         key: '/router/update',
        //         method: 'POST',
        //         handler: 'DefaultRouterConfigurationController',
        //         operation: 'updateRouter',
        //         help: {
        //             requestType: 'secured',
        //             message: 'authToken need to set within header',
        //             method: 'POST',
        //             url: 'http://host:port/nodics/config/router/update',
        //             body: {
        //                 name: 'Name of the router',
        //                 upsert: 'true/false',
        //                 definition: 'definition of JavaScript litteral object'
        //             }
        //         }
        //     },
        //     removeRouter: {
        //         secured: true,
        //         key: '/router/remove',
        //         method: 'POST',
        //         handler: 'DefaultRouterConfigurationController',
        //         operation: 'removeRouter',
        //         help: {
        //             requestType: 'secured',
        //             message: 'authToken need to set within header',
        //             method: 'POST',
        //             url: 'http://host:port/nodics/config/router/remove',
        //             body: {
        //                 name: 'Name of the router',
        //                 operation: 'Name of operation to delete, if blank, whole router will be deleted',
        //                 definition: 'definition of JavaScript litteral object'
        //             }
        //         }
        //     }
        // }
    }
};