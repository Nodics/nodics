/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activeModules: {
        groups: ['gDeap'], // Group 'framework' will be included automatically
        modules: [
            'kickoffDevDeapServer',
            'kickoffDev'
        ]
    },

    search: {
        default: {
            options: {
                enabled: true
            },
            elastic: {
                connection: {
                    hosts: ['http://10.21.77.61:9200', 'http://10.21.77.61:9200'],
                }
            }
        }
    },

    emsClient: {
        logFailedMessages: true,
        clients: {
            activemq: {
                enabled: false
            },
            kafka: {
                enabled: true,
                connectionOptions: {
                    kafkaHost: '10.21.77.64:9092,10.21.77.65:9092,10.21.77.66:9092'
                }
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
                httpPort: 3010,

                httpsHost: 'localhost',
                httpsPort: 3011
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3010,

                httpsHost: 'localhost',
                httpsPort: 3011
            },
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3010,

                    httpsHost: 'localhost',
                    httpsPort: 3011
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
                0: {
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
                0: {
                    httpHost: 'localhost',
                    httpPort: 3004,

                    httpsHost: 'localhost',
                    httpsPort: 3005
                }
            }
        }
    }
};