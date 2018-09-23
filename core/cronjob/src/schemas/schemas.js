/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cronjob: {
        cronJobLog: {
            super: 'default',
            model: true,
            service: true,
            event: false,
            router: false
        },

        cronJob: {
            super: 'base',
            model: true,
            service: true,
            event: false,
            router: true,
            refSchema: {
                logs: {
                    schemaName: 'cronJobLog',
                    type: 'many'
                }
            },
            virtualProperties: {
                fullname: 'DefaultCronJobVirtualService.getFullName',
            },
            definition: {
                nodeId: {
                    type: 'number',
                    required: false
                },
                targetNodeId: {
                    type: 'number',
                    required: false
                },
                runOnInit: {
                    type: 'bool',
                    required: true,
                    default: false
                },
                jobDetail: {
                    type: 'object',
                    required: true
                },
                'jobDetail.startNode': {
                    type: 'string',
                    required: true,
                },
                triggers: {
                    type: 'array',
                    required: true
                },
                active: {
                    type: 'object',
                    required: true,
                },
                'active.start': {
                    type: 'date',
                    required: true,
                },
                priority: {
                    type: 'number',
                    required: true,
                    default: 0
                },
                lastResult: {
                    type: 'string',
                    required: true,
                    default: 'NEW'
                },
                state: {
                    type: 'string',
                    required: true,
                    default: 'NEW'
                }
            }
        },

        importCronJob: {
            super: 'cronJob',
            model: true,
            service: true,
            event: false,
            router: true
        }
    }
};