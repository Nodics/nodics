/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    dynamoEnabled: true,
    publishEnabled: false,
    webEnabled: false,

    activeModules: {
        groups: ['gCore', 'gComm', 'gContent', 'gDeap', 'gMrkty', 'gframesEnvs', 'gframes'], // Group 'framework' will be included automatically
        modules: []
    },

    log: {
        level: 'debug',
        //logLevelDefaultRequestHandlerPipelineService: 'info'
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

    emsClient: {
        logFailedMessages: false,
        publishers: {
            kafkaTempPublisher: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0'
            },
            mqTempPublisher: {
                enabled: true,
                client: 'activemq',
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
        options: {
            contextRoot: 'grayframes'
        }
    }
};