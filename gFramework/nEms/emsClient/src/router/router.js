/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nEms/emsClient/src/router/router
 * @description Defines nEms route registration and HTTP exposure metadata.
 * @layer router
 * @owner nEms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        publishMessage: {
            postMessage: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/publish',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'publish',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/publish',
                    body: {
                        queue: 'Name of the queue',
                        messages: 'Message to be send',
                        partition: 'currently optional, its used for Kafka'
                    }
                }
            }
        },

        registerConsumers: {
            getRegisterConsumer: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/register/consumer/:consumer',
                method: 'GET',
                controller: 'DefaultEmsClientController',
                operation: 'registerConsumers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/register/consumer/:consumer',
                }
            },
            postRegisterConsumers: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/register/consumers',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'registerConsumers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/register/consumers',
                    body: {
                        consumerName: {},
                        consumerName1: {}
                    },
                    body1: ['consumer1', 'consumer2']
                }
            }
        },

        registerPublishers: {
            getRegisterPublisher: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/register/publisher/:publisher',
                method: 'GET',
                controller: 'DefaultEmsClientController',
                operation: 'registerPublishers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/register/publisher/:publisher'
                }
            },
            postRegisterPublishers: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/register/publishers',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'registerPublishers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/register/publishers',
                    body: {
                        publisherName: {},
                        publisherName1: {}
                    },
                    body1: ['consumer1', 'consumer2']
                }
            }
        },

        closeConsumers: {
            getCloseConsumer: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/close/consumer/:consumer',
                method: 'GET',
                controller: 'DefaultEmsClientController',
                operation: 'closeConsumers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/close/consumer/:consumer',
                }
            },
            postCloseConsumers: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/close/consumers',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'closeConsumers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/close/consumers',
                    body: {
                        consumers: ['consumer1', 'consumer2']
                    }
                }
            }
        },

        closePublishers: {
            getClosePublishers: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/close/publisher/:publisher',
                method: 'GET',
                controller: 'DefaultEmsClientController',
                operation: 'closePublishers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/close/publisher/:publisher',
                }
            },
            postClosePublishers: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/close/publishers',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'closePublishers',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/[moduleName]/close/publishers',
                    body: {
                        publishers: ['punlisher1', 'publisher2']
                    }
                }
            }
        }
    }
};