/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nEms/kafka/config/properties
 * @description Defines default nEms configuration used during module startup and layering.
 * @layer config
 * @owner nEms
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
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
                    fetchMaxBytes: 1048576,
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
                        minTimeout: 10,
                        maxTimeout: 600,
                        randomize: true,
                    }
                },
            }
        }
    }
};
