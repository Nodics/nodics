/*
    Nodics - Enterprice API management framework

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
            'FINISHED'
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
            'FAILURE',
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
    },
    ObjectEnum: {
        _options: {
            name: 'ObjectEnum',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: {
            'None': 0,
            'Black': 1,
            'Red': 2,
            'Red2': 3,
            'Green': 4,
            'Blue': 5
        }
    },
};