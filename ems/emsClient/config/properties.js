/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /*database: {
        emsClient: {
            databaseType: 'mongodb', //for Cassandra use 'cassandra'
            mongodb: {
                master: {
                    URI: 'mongodb://localhost:27017',
                    databaseName: 'emsClientMaster',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5
                    }
                },
                test: {
                    URI: 'mongodb://localhost:27017',
                    databaseName: 'emsClientTest',
                    options: {
                        useNewUrlParser: true,
                        poolSize: 5
                    }
                }
            }
        }
    },*/

    server: {
        emsClient: {
            options: {
                contextRoot: 'nodics',
                connectToDefault: false
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3010,

                httpsHost: 'localhost',
                httpsPort: 3011
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3010,

                httpsHost: 'localhost',
                httpsPort: 3011
            },
            //Clusters information is optional and will be managed for Backoffice application
            node: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3010,

                    httpsHost: 'localhost',
                    httpsPort: 3011
                }
            }
        }
    },

    emsClient: {
        enabled: false,
        type: 'activemq', //tibco, activemq, rebbitmq, Kafka

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
                nodeId: '0'
            }, {
                messageType: "intData",
                inputQueue: "nodicsIntInput",
                outputQueue: "nodicsIntOutput",
                targetModule: 'emsClient',
                nodeId: '0'
            }]
        },

        kafka: {
            handler: 'DefaultKafkaClientService',
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
                nodeId: '0'
            }]
        }
    }
};