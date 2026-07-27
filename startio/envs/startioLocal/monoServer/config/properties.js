/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/monoServer/config/properties
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
            // Activate the provider-neutral AI group module. Its required modules
            // are loaded without implicitly activating every vendor adapter.
            'gAi',
            // Activate only the vendor adapter selected by the local
            // assistantGeneration profile.
            'openAiProvider',
            'monoServer',
            'startioLocal'
        ]
    },

    log: {
        level: 'debug',
        //logLevelDefaultRequestHandlerPipelineService: 'info'
    },

    search: {
        default: {
            options: {
                enabled: true,
                fallback: false,
                engine: 'elastic'
            }
        }
    },

    // Server scope chooses only the active gateway/profile/provider binding.
    // Vendor definitions, pricing, secrets, and token policy remain module-owned.
    aiProviders: {
        enabled: true,
        profiles: {
            assistantGeneration: {
                provider: 'openAi',
                model: 'gpt-5-mini'
            }
        },
        providers: {
            openAi: {
                enabled: true
            }
        }
    },

    emsClient: {
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
