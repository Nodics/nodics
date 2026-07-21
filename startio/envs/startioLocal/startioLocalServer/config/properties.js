/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

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
    // Keep generic nPublish contracts in the consolidated build; each domain still enables publication independently.
    publishEnabled: true,
    webEnabled: false,

    activeModules: {
        groups: ['gCore', 'gComm', 'gContent', 'gDeap', 'gExp', 'gMrkty', 'modules'], // Group 'framework' will be included automatically
        modules: [
            'profile',
            'nems',
            'cronjob',
            'workflow',
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

    servers: {
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
        //     endpoint: {
        //         httpHost: 'localhost',
        //         httpPort: 3002,

        //         httpsHost: 'localhost',
        //         httpsPort: 3003
        //     }
        // },
        // cronjob: {
        //     endpoint: {
        //         httpHost: 'localhost',
        //         httpPort: 3004,

        //         httpsHost: 'localhost',
        //         httpsPort: 3005
        //     }
        // }
    }
};
