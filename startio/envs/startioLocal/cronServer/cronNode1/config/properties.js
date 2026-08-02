/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module startio/envs/startioLocal/cronServer/cronNode1/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {

    nodeId: 'node1',

    servers: {
        default: {
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3032,

                httpsHost: 'localhost',
                httpsPort: 3033
            }
        }
    }
};
