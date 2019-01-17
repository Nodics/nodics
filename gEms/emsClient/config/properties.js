/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    emsClient: {
        enabled: false,
        type: 'kafka', //tibco, activemq, rebbitmq, kafka

        tibco: {
            handler: 'DefaultTibcoClientService',
            options: {
                url: "tcp://10.106.207.92:7222",
                username: "admin",
                password: "admin",
            },
            queues: [{
                messageType: 'stockData',
                inputQueue: 'nodicsApplicationInput',
                outputQueue: 'nodicsApplicationOutput',
                targetModule: 'emsClient',
                nodeId: '0'
            }]
        },

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
        },

        kafka: {
            handler: 'DefaultKafkaClientService',
            publisherType: 1, // 0 for normal, 1 for HighLevel Producer
            consumerType: 0, // 0 for normal, 1 for HighLevel Producer
            options: {
                source: 'emsClient',
                target: 'emsClient',
                nodeId: '0'
            },
            publisherOptions: {
                requireAcks: 1,
                ackTimeoutMs: 100,
                partitionerType: 0
            },
            consumerOptions: {
                autoCommit: true,
                fetchMaxWaitMs: 1000,
                fetchMaxBytes: 1024 * 1024,
                encoding: 'buffer',
                keyEncoding: 'utf8'
            },
            connectionOptions: {
                kafkaHost: 'localhost:9092',
                connectTimeout: 10,
                requestTimeout: 30000,
                autoConnect: true,
                idleConnection: 5000,
                maxAsyncRequests: 10,
                connectRetryOptions: {
                    retries: 5,
                    factor: 3,
                    minTimeout: 1 * 10,
                    maxTimeout: 60 * 10,
                    randomize: true,
                }
            },
            queues: [{
                type: 'publisher',
                name: 'testPublisherQueue'
            }, {
                type: 'consumer',
                name: 'testConsumerQueue'
            }]
        }
    }
};