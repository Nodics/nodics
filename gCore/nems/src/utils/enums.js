/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
