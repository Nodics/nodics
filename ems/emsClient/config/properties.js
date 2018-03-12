/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    emsClient: {
        enabled: true,
        type: 'activemq', //tibco, activemq, rebbitmq, Kafka

        tibco: {
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
                clusterId: '0'
            }]
        },

        activemq: {
            options: {
                host: 'localhost',
                port: 61613,
                connectHeaders: {
                    'host': '/',
                    'login': 'admin',
                    'passcode': 'admin',
                    'heart-beat': '5000,5000'
                }
            },
            queues: [{
                messageType: 'stockData',
                inputQueue: 'nodicsApplicationInput',
                outputQueue: 'nodicsApplicationOutput',
                targetModule: 'emsClient',
                clusterId: '0'
            }, {
                messageType: "intData",
                inputQueue: "nodicsIntInput",
                outputQueue: "nodicsIntOutput",
                targetModule: 'emsClient',
                clusterId: '0'
            }]
        },

        kafka: {
            publisherType: 1, // 0 for normal, 1 for HighLevel Producer
            consumerType: 0, // 0 for normal, 1 for HighLevel Producer
            options: {
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
                messageType: 'stockData',
                inputQueue: 'nodicsApplicationInput',
                outputQueue: 'nodicsApplicationOutputNew',
                consumerOptions: {
                    autoCommit: true,
                    fetchMaxWaitMs: 1000,
                    fetchMaxBytes: 1024 * 1024,
                    encoding: 'buffer'
                },
                targetModule: 'emsClient',
                clusterId: '0'
            }]
        }
    }
};