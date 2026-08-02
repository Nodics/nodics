/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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

    servers: {
        default: {
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
