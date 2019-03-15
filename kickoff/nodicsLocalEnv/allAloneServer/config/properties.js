/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activeModules: {
        updateGroups: true,
        //groups: ['core', 'ems'], // Group 'framework' will be included automatically
        modules: [
            'cronjob',
            'nems',
            'emsClient',
            'powerTool',
            'allAloneServer',
            'kickoff',
            'nodicsLocalEnv'
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
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                }
            }
        },
        profile: {
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
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                }
            }
        },
        cronjob: {
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
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3002,

                    httpsHost: 'localhost',
                    httpsPort: 3003
                }
            }
        },
        nems: {
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
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3004,

                    httpsHost: 'localhost',
                    httpsPort: 3005
                }
            }
        },
        emsClient: {
            server: {
                httpHost: 'localhost',
                httpPort: 3006,

                httpsHost: 'localhost',
                httpsPort: 3007
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3006,

                httpsHost: 'localhost',
                httpsPort: 3007
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3006,

                    httpsHost: 'localhost',
                    httpsPort: 3007
                }
            }
        },
        powerTool: {
            server: {
                httpHost: 'localhost',
                httpPort: 3008,

                httpsHost: 'localhost',
                httpsPort: 3009
            },
            abstract: {
                httpHost: 'localhost',
                httpPort: 3008,

                httpsHost: 'localhost',
                httpsPort: 3009
            },
            //Clusters information is optional and will be managed for Backoffice application
            nodes: {
                0: {
                    httpHost: 'localhost',
                    httpPort: 3008,

                    httpsHost: 'localhost',
                    httpsPort: 3009
                }
            }
        }
    }
};