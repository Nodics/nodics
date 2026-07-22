/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/deapServer/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    activeModules: {
        groups: ['gDeap', 'modules'], // Group 'framework' will be included automatically
        modules: [
            'deapServer',
            'startioLocal'
        ]
    },

    log: {
        level: 'debug'
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
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3010,

                httpsHost: 'localhost',
                httpsPort: 3011
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3010,

                httpsHost: 'localhost',
                httpsPort: 3011
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3010,

                    httpsHost: 'localhost',
                    httpsPort: 3011
                },
                node1: {
                    httpHost: 'localhost',
                    httpPort: 3012,

                    httpsHost: 'localhost',
                    httpsPort: 3013
                },
                node2: {
                    httpHost: 'localhost',
                    httpPort: 3014,

                    httpsHost: 'localhost',
                    httpsPort: 3015
                }
            }
        },

        profile: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                }
            }
        },

        // This configuration required to push any event needs to be send for other module
        nems: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3020,

                httpsHost: 'localhost',
                httpsPort: 3021
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3020,

                httpsHost: 'localhost',
                httpsPort: 3021
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3020,

                    httpsHost: 'localhost',
                    httpsPort: 3021
                }
            }
        },
        backoffice: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'localhost', httpPort: 3060, httpsHost: 'localhost', httpsPort: 3061 },
            abstractEndpoint: { httpHost: 'localhost', httpPort: 3060, httpsHost: 'localhost', httpsPort: 3061 },
            nodes: { node0: { httpHost: 'localhost', httpPort: 3060, httpsHost: 'localhost', httpsPort: 3061 } }
        }
    }
};
