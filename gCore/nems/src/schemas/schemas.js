/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    nems: {
        event: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {
                sourceName: {
                    type: 'string',
                    required: true,
                    description: 'Source module from where this event is triggered'
                },
                sourceId: {
                    type: 'string',
                    required: true,
                    description: 'NodeId from where this event is triggered'
                },
                tenant: {
                    type: 'string',
                    required: true,
                    description: 'Required to identify database connection for operations'
                },
                event: {
                    type: 'string',
                    required: true,
                    description: 'Event name which needs to be triggered'
                },
                type: {
                    enum: [ENUMS.EventType.SYNC.key, ENUMS.EventType.ASYNC.key],
                    required: true,
                    default: ENUMS.EventType.ASYNC.key,
                    description: 'Where this event needs to be pushed [SYSNC, ASYNC]'
                },
                targetType: {
                    enum: [ENUMS.TargetType.EXTERNAL.key, ENUMS.TargetType.EACH_MODULE_NODES.key, ENUMS.TargetType.EACH_MODULE.key, ENUMS.TargetType.MODULE_NODES.key, ENUMS.TargetType.MODULE.key],
                    required: true,
                    default: ENUMS.TargetType.MODULE.key,
                    description: 'Where this event needs to be pushed [EXTERNAL, EACH_MODULE_NODES, EACH_MODULE, MODULE_NODES,MODULE]'
                },
                targetNodeId: {
                    type: 'string',
                    required: false,
                    description: 'To target direct node or cluster for this event'
                },
                hits: {
                    type: 'int',
                    required: true,
                    default: 0,
                    description: 'Number of tries to push this event while getting error'
                },
                state: {
                    enum: [ENUMS.EventState.NEW.key, ENUMS.EventState.PROCESSING.key, ENUMS.EventState.FINISHED.key, ENUMS.EventState.ERROR.key],
                    required: true,
                    default: ENUMS.EventState.NEW.key,
                    description: 'Current state of job, [NEW, PROCESSING, FINISHED, ERROR]'
                },
                params: {
                    type: 'array',
                    required: false,
                    description: 'Values which needs to be send with event to target system'
                },
            }
        },

        eventLog: {
            super: 'event',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            }
        }
    }
};