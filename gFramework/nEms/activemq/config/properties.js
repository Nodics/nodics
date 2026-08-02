/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nEms/activemq/config/properties
 * @description Defines default nEms configuration used during module startup and layering.
 * @layer config
 * @owner nEms
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
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