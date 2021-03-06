/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    emsClient: {
        clients: {
            activemq: {
                enabled: false,
                handler: 'DefaultActivemqClientService',
                eventOptions: {
                    nodeId: 'node0',
                    eventType: 'ASYNC'
                },
                publisherOptions: {
                    requireAcks: 1,
                    ackTimeoutMs: 3000,
                    partitionerType: 0
                },
                consumerOptions: {
                    encodingType: 'UTF-8',
                    acknowledgeType: 'client-individual', // auto, client, client-individual
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
                    "initialReconnectDelay": 50000,    // milliseconds delay of the first reconnect
                    "maxReconnectDelay": 5000,     // maximum milliseconds delay of any reconnect
                    "useExponentialBackOff": true,  // exponential increase in reconnect delay
                    "maxReconnects": 100,            // maximum number of failed reconnects consecutively
                    "randomize": false,            // randomly choose a server to use when reconnecting
                    connect: {
                        connectHeaders: {
                            'heart-beat': '5000,5000'
                        }
                    }
                },
            }
        }
    }
};