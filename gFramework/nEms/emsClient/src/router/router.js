/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    common: {
        publishMessage: {
            postMessage: {
                secured: true,
                key: '/publish',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'publish',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/emsClient/publish',
                    body: {
                        queue: 'Name of the queue',
                        messages: 'Message to be send',
                        partition: 'currently optional, its used for Kafka'
                    }
                }
            }
        },

        registerConsumers: {
            postRegisterConsumers: {
                secured: true,
                key: '/register/consumer',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'registerConsumers',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/emsClient/publish',
                    body: {
                        consumerName
                    }
                }
            }
        },

        registerPublishers: {
            postRegisterPublishers: {
                secured: true,
                key: '/register/consumer',
                method: 'POST',
                controller: 'DefaultEmsClientController',
                operation: 'registerPublishers',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/emsClient/publish',
                    body: {
                        consumerName: {},
                        consumerName1: {}
                    }
                }
            }
        }
    }
};