/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
let mongoose = require('mongoose');

module.exports = {
    nems: {
        event: {
            super: 'base',
            model: true,
            service: true,
            event: false,
            router: true,
            definition: {
                event: {
                    type: 'String'
                },
                source: {
                    type: 'String'
                },
                target: {
                    type: 'String'
                },
                nodeId: {
                    type: 'String'
                },
                targetType: {
                    type: 'String',
                    enum: ENUMS.TargetType.getEnumValue(),
                    default: ENUMS.TargetType.MODULE.key
                },
                state: {
                    type: 'String',
                    enum: ENUMS.EventState.getEnumValue(),
                    default: ENUMS.EventState.NEW.key,
                    index: true
                },
                type: {
                    type: 'String',
                    enum: ENUMS.EventType.getEnumValue(),
                    default: ENUMS.EventType.ASYNC.key
                },
                hits: {
                    type: 'Number',
                    default: 0,
                    index: true
                },
                log: [{
                    type: 'String'
                }],
                params: [{
                    type: mongoose.Schema.Types.Mixed,
                    required: false
                }]
            }
        },

        eventLog: {
            super: 'event',
            model: true,
            service: true,
            event: false,
            router: false,
            definition: {

            }
        }
    }
};