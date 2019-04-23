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
            kafka: {
                enabled: false,
                handler: 'DefaultKafkaClientService',
                publisherType: 1, // 0 for normal, 1 for HighLevel Producer
                consumerType: 0, // 0 for normal, 1 for HighLevel Producer
                eventOptions: {
                    source: 'emsClient',
                    target: 'emsClient',
                    nodeId: '0',
                    eventType: 'ASYNC'
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
            }
        },
        // consumers: {
        //     kafkaJSONTestConsumerQueue: {
        //         enabled: true,
        //         client: 'kafka',
        //         options: {
        //             messageHandler: 'jsonMessageHandler',
        //             target: 'intData',
        //             eventName: 'handleInternalTestData'
        //         }
        //     },
        //     kafkaXMLTestConsumerQueue: {
        //         enabled: true,
        //         client: 'kafka',
        //         options: {
        //             messageHandler: 'xmlMessageHandler',
        //             target: 'intData',
        //             eventName: 'handleInternalTestData'
        //         }
        //     }
        // },
        // publishers: {
        //     kafkaJSONTestPublisherQueue: {
        //         enabled: true,
        //         client: 'kafka',
        //         options: {
        //             messageHandler: 'jsonMessageHandler'
        //         }
        //     },
        //     kafkaXMLTestPublisherQueue: {
        //         enabled: true,
        //         client: 'kafka',
        //         options: {
        //             messageHandler: 'xmlMessageHandler'
        //         }
        //     }
        // }
    }
};