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
            super: 'super',
            model: true,
            service: true,
            event: false,
            router: true,
            search: {
                enabled: true,
                idPropertyName: '_id',
            },
            definition: {
                active: {
                    required: false
                },
                jobCode: {
                    type: 'string',
                    required: true
                }
            }
        },

        cronJob: {
            super: 'base',
            model: true,
            service: true,
            cache: {
                enabled: false,
                ttl: 100
            },
            event: false,
            router: true,
            virtualProperties: {
                fullname: 'DefaultCronJobVirtualService.getFullName',
            },
            definition: {
                runOnNode: {
                    type: 'int',
                    required: true,
                    description: 'Execution node or cluster id, where job will run. this to avoid running job in multiple nodes'
                },
                runOnInit: {
                    type: 'bool',
                    required: true,
                    default: false,
                    description: 'Required to flag if need to run imitiately job created'
                },
                jobDetail: {
                    type: 'object',
                    required: false,
                    description: 'Required to give job handler startNode, endNode and errorNode service funtions'
                },
                trigger: {
                    type: 'object',
                    required: true,
                    description: 'Number of trigger expression'
                },
                start: {
                    type: 'date',
                    required: true,
                    description: 'Job start timestamp'
                },
                end: {
                    type: 'date',
                    required: false,
                    description: 'Job end timestamp'
                },
                priority: {
                    type: 'number',
                    required: true,
                    default: 0,
                    description: 'define priority to get preference when there are multiple job'
                },
                status: {
                    type: 'string',
                    required: true,
                    default: 'NEW',
                    description: 'Last execution result [NEW, SUCCESS ERROR]'
                },
                state: {
                    type: 'string',
                    required: true,
                    default: 'NEW',
                    description: 'Current state of JOB'
                },
                log: {
                    type: 'array',
                    required: false,
                    description: 'Last result of job execution'
                },
                emails: {
                    type: 'array',
                    required: false,
                    description: 'List of email ids to send execution report'
                }
            }
        }
    }
};