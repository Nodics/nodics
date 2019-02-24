/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    emsClient: {
        activemq: {
            handler: 'DefaultActivemqClientService',
            options: {
                encodingType: 'UTF-8',
                acknowledgeType: 'client-individual',
                ackRequired: true,
                source: 'emsClient',
                target: 'emsClient',
                nodeId: '0'
            },
            connectionOptions: [{
                host: 'localhost',
                port: 61613,
                'connectHeaders': {
                    'host': '/',
                    'login': 'admin',
                    'passcode': 'admin',
                    'heart-beat': '5000,5000'
                }
            }],
            reconnectOptions: {
                "initialReconnectDelay": 10,    // milliseconds delay of the first reconnect
                "maxReconnectDelay": 5000,     // maximum milliseconds delay of any reconnect
                "useExponentialBackOff": true,  // exponential increase in reconnect delay
                "maxReconnects": 30,            // maximum number of failed reconnects consecutively
                "randomize": false              // randomly choose a server to use when reconnecting
            },
            queues: [{
                type: 'publisher',
                name: 'testPublisherQueue'
            }, {
                type: 'consumer',
                name: 'testConsumerQueue',
                options: {
                    encodingType: 'UTF-8',
                    acknowledgeType: 'client-individual',
                    targetModule: 'emsClient',
                    nodeId: '0'
                }
            }]
        }
    }
};