/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/nemsServer/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    activeModules: {
        groups: ['modules'], // Group 'framework' will be included automatically
        modules: [
            'nems',
            'nemsServer',
            'startioLocal'
        ]
    },
    log: {
        level: 'debug'
    },

    servers: {
        default: {
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

        cronjob: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3030,

                httpsHost: 'localhost',
                httpsPort: 3031
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3030,

                httpsHost: 'localhost',
                httpsPort: 3031
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3030,

                    httpsHost: 'localhost',
                    httpsPort: 3031
                },
                node1: {
                    httpHost: 'localhost',
                    httpPort: 3032,

                    httpsHost: 'localhost',
                    httpsPort: 3033
                },
                node2: {
                    httpHost: 'localhost',
                    httpPort: 3034,

                    httpsHost: 'localhost',
                    httpsPort: 3035
                },
                node3: {
                    httpHost: 'localhost',
                    httpPort: 3036,

                    httpsHost: 'localhost',
                    httpsPort: 3037
                }
            }
        },

        cms: {
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

        workflow: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3050,

                httpsHost: 'localhost',
                httpsPort: 3051
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3050,

                httpsHost: 'localhost',
                httpsPort: 3051
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3050,

                    httpsHost: 'localhost',
                    httpsPort: 3051
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
