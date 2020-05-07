/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activeModules: {
        groups: ['kickoffModules'], // Group 'framework' will be included automatically
        modules: [
            'cronjob',
            'kickoffLocalCronServer',
            'kickoffLocal'
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
        runOnStartup: true
    },

    search: {
        default: {
            options: {
                enabled: false
            }
        }
    },

    server: {
        default: {
            options: {
                contextRoot: 'nodics'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3030,

                httpsHost: 'localhost',
                httpsPort: 3031
            },
            abstract: {
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

        // This configuration required to load enterprise, tenants and all internal communication
        profile: {
            options: {
                contextRoot: 'nodics'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },
            abstract: {
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
            server: {
                httpHost: 'localhost',
                httpPort: 3020,

                httpsHost: 'localhost',
                httpsPort: 3021
            },
            abstract: {
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
        }
    }
};