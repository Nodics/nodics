/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    dynamoEnabled: true,
    publishEnabled: false,
    webEnabled: false,

    activeModules: {
        groups: ['gCore', 'gDeap', 'kickoffModules'], // Group 'framework' will be included automatically
        modules: [
            'kickoffLocalServer',
            'kickoffLocal'
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
                enabled: false
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
                node1: {
                    httpHost: 'localhost',
                    httpPort: 3002,

                    httpsHost: 'localhost',
                    httpsPort: 3003
                },
                node2: {
                    httpHost: 'localhost',
                    httpPort: 3004,

                    httpsHost: 'localhost',
                    httpsPort: 3005
                }
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