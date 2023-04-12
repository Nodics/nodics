/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    WorkflowCarrierType: {
        _options: {
            name: 'WorkflowCarrierType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'FIXED',
            'FLEXI'
        ]
    },

    WorkflowCarrierState: {
        _options: {
            name: 'WorkflowCarrierState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'INIT',
            'RELEASED',
            'PROCESSING',
            'PROCESSED',
            'SPLITTED',
            'PAUSED',
            'BLOCKED',
            'FINISHED',
            'ERROR',
            'FATAL'
        ]
    },

    WorkflowActionState: {
        _options: {
            name: 'WorkflowActionState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'PROCESSING',
            'FINISHED',
            'ERROR',
            'FATAL'
        ]
    },

    WorkflowActionResponseType: {
        _options: {
            name: 'WorkflowActionResponseType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'SUCCESS',
            'REJECTED',
            'ERROR'
        ]
    },

    WorkflowActionType: {
        _options: {
            name: 'WorkflowActionType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'MANUAL',
            'AUTO',
            'PARALLEL'
        ]
    },

    WorkflowActionPosition: {
        _options: {
            name: 'WorkflowActionPosition',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'HEAD',
            'ACTION',
            'END'
        ]
    }
};