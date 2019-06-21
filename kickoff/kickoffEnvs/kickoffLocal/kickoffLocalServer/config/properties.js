/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    activeModules: {
        groups: ['gCore', 'gTools', 'gDeap', 'kickoffModules'], // Group 'framework' will be included automatically
        modules: [
            'kickoffLocalServer',
            'kickoffLocal'
        ]
    },

    log: {
        level: 'debug'
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
        clients: {
            activemq: {
                enabled: false
            },
            kafka: {
                enabled: true
            }
        }
    }
};