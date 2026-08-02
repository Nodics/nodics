/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/utils/enums
 * @description Cronjob enum definitions for lifecycle state, trigger status, and scheduling behavior.
 * @layer utility
 * @owner cronjob
 * @override Project modules may add later enum fragments only when cronjob state handling supports them.
 */
module.exports = {
    CronJobState: {
        _options: {
            name: 'CronJobState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'RUNNING',
            'ACTIVE',
            'PAUSED',
            'STOPED',
            'CREATED',
            'REMOVED'
        ]
    },
    CronJobStatus: {
        _options: {
            name: 'CronJobStatus',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'SUCCESS',
            'ERROR'
        ]
    },
    TriggerType: {
        _options: {
            name: 'TriggerType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'RANGES',
            'STEPS'
        ]
    }
};
