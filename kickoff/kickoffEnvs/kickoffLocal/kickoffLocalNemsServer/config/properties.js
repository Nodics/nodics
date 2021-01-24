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
            'nems',
            'kickoffLocalNemsServer',
            'kickoffLocal'
        ]
    },
    log: {
        level: 'debug'
    },

    server: {
        default: {
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

        dataConsumer: {
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

        cms: {
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
        },

        workflow: {
            options: {
                contextRoot: 'nodics'
            },
            server: {
                httpHost: 'localhost',
                httpPort: 3050,

                httpsHost: 'localhost',
                httpsPort: 3051
            },
            abstract: {
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
        }

    }
};