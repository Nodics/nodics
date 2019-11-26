/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activeModules: {
        groups: ['gCore', 'gDeap', 'kickoffModules'], // Group 'framework' will be included automatically
        modules: [
            'kickoffDevServer',
            'kickoffDev'
        ]
    },

    cronjob: {
        runOnStartup: false
    },

    search: {
        default: {
            options: {
                enabled: false
            },
            elastic: {
                connection: {
                    hosts: ['http://10.21.77.61:9200', 'http://10.21.77.61:9200'],
                }
            }
        }
    },

    emsClient: {
        logFailedMessages: false,
        clients: {
            activemq: {
                enabled: false
            },
            kafka: {
                enabled: false,
                connectionOptions: {
                    kafkaHost: '10.21.77.64:9092,10.21.77.65:9092,10.21.77.66:9092'
                }
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