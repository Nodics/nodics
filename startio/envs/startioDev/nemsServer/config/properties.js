/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioDev/nemsServer/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    activeModules: {
        //groups: ['core', 'ems'], // Group 'framework' will be included automatically
        modules: [
            'nems',
            'nemsServer',
            'startioLocal'
        ]
    },

    servers: {
        default: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3004,

                httpsHost: 'localhost',
                httpsPort: 3005
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3004,

                httpsHost: 'localhost',
                httpsPort: 3005
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3004,

                    httpsHost: 'localhost',
                    httpsPort: 3005
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

        cronjob: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3002,

                httpsHost: 'localhost',
                httpsPort: 3003
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3002,

                httpsHost: 'localhost',
                httpsPort: 3003
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3002,

                    httpsHost: 'localhost',
                    httpsPort: 3003
                }
            }
        },

        powerTool: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3008,

                httpsHost: 'localhost',
                httpsPort: 3009
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3008,

                httpsHost: 'localhost',
                httpsPort: 3009
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3008,

                    httpsHost: 'localhost',
                    httpsPort: 3009
                }
            }
        },

        dataConsumer: {
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
                }
            }
        }
    }
};
