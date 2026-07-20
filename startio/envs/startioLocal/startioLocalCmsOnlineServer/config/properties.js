/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startioLocalCmsOnlineServer/config/properties
 * @description Defines generated configurable defaults for startioLocalCmsOnlineServer.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    publishEnabled: false,
    activeModules: {
        groups: ['modules'],
        modules: ['cms', 'startioLocalCmsOnlineServer', 'startioLocal']
    },
    log: { level: 'info' },
    database: {
        default: {
            mongodb: {
                master: { databaseName: 'startioCmsOnline' },
                test: { databaseName: 'startioCmsOnlineTest' }
            }
        }
    },
    cms: {
        publication: {
            enabled: true,
            runtimeRole: 'ONLINE',
            targetTransportProvider: null
        }
    },
    servers: {
        default: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            abstractEndpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            nodes: { node0: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 } }
        },
        profile: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'localhost', httpPort: 3000, httpsHost: 'localhost', httpsPort: 3001 },
            abstractEndpoint: { httpHost: 'localhost', httpPort: 3000, httpsHost: 'localhost', httpsPort: 3001 },
            nodes: { node0: { httpHost: 'localhost', httpPort: 3000, httpsHost: 'localhost', httpsPort: 3001 } }
        },
        backoffice: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'localhost', httpPort: 3060, httpsHost: 'localhost', httpsPort: 3061 },
            abstractEndpoint: { httpHost: 'localhost', httpPort: 3060, httpsHost: 'localhost', httpsPort: 3061 },
            nodes: { node0: { httpHost: 'localhost', httpPort: 3060, httpsHost: 'localhost', httpsPort: 3061 } }
        }
    }
};
