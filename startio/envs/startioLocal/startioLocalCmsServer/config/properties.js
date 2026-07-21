/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/startioLocalCmsServer/config/properties
 * @description Defines default envs configuration used during module startup and layering.
 * @layer config
 * @owner envs
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    publishEnabled: true,
    activeModules: {
        groups: ['modules'], // Group 'framework' will be included automatically
        modules: [
            'cms',
            'wcms',
            'workflow',
            'publish',
            'units',
            'pricing',
            'product',
            'startioLocalCmsServer',
            'startioLocal'
        ]
    },
    activateNodePing: true,
    nodePingableModules: {
        cronjob: {
            enabled: true
        }
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

    database: {
        default: {
            mongodb: {
                master: { databaseName: 'startioCmsStaged' },
                test: { databaseName: 'startioCmsStagedTest' }
            }
        }
    },

    cms: {
        publication: {
            enabled: false,
            runtimeRole: 'STAGED',
            targetTransportProvider: 'DefaultCmsPublicationModuleTransportService',
            target: {
                moduleName: 'cms',
                connectionName: 'cmsOnline',
                connectionType: 'server',
                timeoutMs: 30000,
                maxAttempts: 3
            }
        }
    },

    pricing: {
        publication: {
            enabled: true,
            runtimeRole: 'STAGED',
            targetTransportProvider: 'DefaultPricingPublicationModuleTransportService',
            target: {
                moduleName: 'pricing',
                connectionName: 'pricingOnline',
                connectionType: 'server',
                timeoutMs: 30000,
                maxAttempts: 3
            }
        }
    },

    product: {
        publication: {
            enabled: true,
            runtimeRole: 'STAGED',
            targetTransportProvider: 'DefaultProductPublicationModuleTransportService',
            target: {
                moduleName: 'product',
                connectionName: 'productOnline',
                connectionType: 'server',
                timeoutMs: 30000,
                maxAttempts: 3
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
                httpPort: 3040,

                httpsHost: 'localhost',
                httpsPort: 3041
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3040,

                httpsHost: 'localhost',
                httpsPort: 3041
            },
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3040,

                    httpsHost: 'localhost',
                    httpsPort: 3041
                }
            }
        },

        // This configuration required to load enterprise, tenants and all internal communication
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
        },
        cmsOnline: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            abstractEndpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            nodes: { node0: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 } }
        },
        pricingOnline: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            abstractEndpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            nodes: { node0: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 } }
        }
        ,productOnline: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            abstractEndpoint: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 },
            nodes: { node0: { httpHost: 'localhost', httpPort: 3070, httpsHost: 'localhost', httpsPort: 3071 } }
        }
    }
};
