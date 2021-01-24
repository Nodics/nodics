/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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