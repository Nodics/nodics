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
                    autoCommit: true,
                    fetchMaxWaitMs: 1000,
                    fetchMaxBytes: 1024 * 1024,
                    keyEncoding: 'utf8'
                },
                connectionOptions: {
                    kafkaHost: 'localhost:9092',
                    connectTimeout: 10000,
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
        }
    }
};