/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nems/utils/enums
 * @description Event state and event type enum definitions used by NEMS processing and dispatch.
 * @layer utility
 * @owner nems
 * @override Project modules may add later enum fragments only when event processing supports them.
 */
module.exports = {
    EventState: {
        _options: {
            name: 'EventState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'PROCESSING',
            'FINISHED',
            'ERROR'
        ]
    },

    EventType: {
        _options: {
            name: 'EventState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'SYNC',
            'ASYNC'
        ]
    }
};
