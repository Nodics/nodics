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
            super: 'base',
            model: true,
            service: true,
            event: false,
            router: true,
            definition: {
                source: {
                    type: 'string',
                    required: true,
                    description: 'Source module from where this event is triggered'
                },
                target: {
                    type: 'string',
                    required: true,
                    description: 'Target module where this event needs to be send'
                },
                targetType: {
                    type: 'string',
                    required: true,
                    default: ENUMS.TargetType.MODULE.key,
                    description: 'Where this event needs to be pushed [EACH_NODE, EACH_MODULE, MODULE]'
                },
                targetNodeId: {
                    type: 'int',
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
                    type: 'string',
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
            service: true,
            event: false,
            router: false
        }
    }
};