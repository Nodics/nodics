/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activeModules: {
        groups: ['gDeap', 'kickoffModules'], // Group 'framework' will be included automatically
        modules: [
            'kickoffLocalDeapServer',
            'kickoffLocal'
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

    nodePingableModules: {
        dataConsumer: {
            enabled: true
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
                httpPort: 3002,

                httpsHost: 'localhost',
                httpsPort: 3003
            },
            abstract: {
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
                },
                node1: {
                    httpHost: 'localhost',
                    httpPort: 3012,

                    httpsHost: 'localhost',
                    httpsPort: 3013
                }
            }
        },

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

        nems: {
            options: {
                contextRoot: 'nodics'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3004,

                httpsHost: 'localhost',
                httpsPort: 3005
            },
            abstract: {
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
        }
    }
};