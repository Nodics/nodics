/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/startioLocalServer/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {

    dynamoEnabled: true,
    publishEnabled: false,
    webEnabled: false,

    activeModules: {
        groups: ['gCore', 'gComm', 'gContent', 'gDeap', 'gMrkty', 'modules'], // Group 'framework' will be included automatically
        modules: [
            'startioLocalServer',
            'startioLocal'
        ]
    },

    log: {
        level: 'debug',
        //logLevelDefaultRequestHandlerPipelineService: 'info'
    },

    cronjob: {
        runOnStartup: false
    },

    search: {
        default: {
            options: {
                enabled: false
            }
        }
    },

    emsClient: {
        logFailedMessages: false,
        publishers: {
            kafkaTempPublisher: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0'
            },
            mqTempPublisher: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0'
            }
        },
        clients: {
            activemq: {
                enabled: false
            },
            kafka: {
                enabled: true
            }
        }
    },

    server: {
        default: {
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                },
                // node1: {
                //     httpHost: 'localhost',
                //     httpPort: 3002,

                //     httpsHost: 'localhost',
                //     httpsPort: 3003
                // },
                // node2: {
                //     httpHost: 'localhost',
                //     httpPort: 3004,

                //     httpsHost: 'localhost',
                //     httpsPort: 3005
                // }
            }
        },
        // profile: {
        //     server: {
        //         httpHost: 'localhost',
        //         httpPort: 3002,

        //         httpsHost: 'localhost',
        //         httpsPort: 3003
        //     }
        // },
        // cronjob: {
        //     server: {
        //         httpHost: 'localhost',
        //         httpPort: 3004,

        //         httpsHost: 'localhost',
        //         httpsPort: 3005
        //     }
        // }
    }
};
