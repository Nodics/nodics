/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    log: {
        level: 'debug',
        transports: {
            console: {
                consoleTransport: {
                    enabled: true
                }
            },
            file: {
                fileErrorLog: {
                    enabled: false
                },
                fileRestLog: {
                    enabled: false
                }
            },
            elastic: {
                elasticLogRecorder: {
                    enabled: false,
                    client: {
                        hosts: ['http://10.21.77.61:9200', 'http://10.21.77.61:9200']
                    }
                }
            }
        }
    },

    cache: {
        default: {
            channels: {
                router: {
                    engine: 'redis'
                },
                schema: {
                    engine: 'redis'
                }
            },
            engines: {
                redis: {
                    options: {
                        host: '10.21.77.75',
                        port: 6379
                    }
                },
            }
        }
    },

    database: {
        default: {
            mongodb: {
                master: {
                    URI: 'mongodb://10.21.77.63:27017,10.21.77.64:27017,10.21.77.66:27017/?replicaSet=vms.mongo-01',
                    databaseName: 'teeDefaultMaster'
                },
                test: {
                    URI: 'mongodb://10.21.77.63:27017,10.21.77.64:27017,10.21.77.66:27017/?replicaSet=vms.mongo-01',
                    databaseName: 'teeDefaultTest'
                }
            }
        }
    }
};