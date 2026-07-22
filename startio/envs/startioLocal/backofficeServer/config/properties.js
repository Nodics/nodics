/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/backofficeServer/config/properties
 * @description Composes the local modular runtime for the Nodics BackOffice registry capability.
 * @layer config
 * @owner backofficeServer
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    activeModules: {
        groups: ['gExp', 'modules'], // Group 'framework' will be included automatically
        modules: [
            'backoffice',
            'backofficeServer',
            'startioLocal'
        ]
    },

    log: {
        level: 'info'
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

    servers: {
        default: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3060,
                httpsHost: 'localhost',
                httpsPort: 3061
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3060,
                httpsHost: 'localhost',
                httpsPort: 3061
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3060,
                    httpsHost: 'localhost',
                    httpsPort: 3061
                }
            }
        },

        // Authentication remains owned by the independently deployed Profile module.
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
        }
    }
};
