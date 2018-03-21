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
                clusterId: {
                    type: 'String'
                },
                state: {
                    type: 'String',
                    enum: ENUMS.EventState.getEnumValue(),
                    default: ENUMS.EventState.NEW,
                    index: true
                },
                type: {
                    type: 'String',
                    enum: ENUMS.EventType.getEnumValue(),
                    default: ENUMS.EventType.ASYNC
                },
                hits: {
                    type: 'Number',
                    default: 0,
                    index: true
                },
                log: [{
                    type: 'String'
                }],
                params: [{}]
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
        },
        /*
            temp: {
                super: 'none',
                model: true,
                service: true,
                event: false,
                router: true,
                definition: {

                }
            }
        */
    }
};