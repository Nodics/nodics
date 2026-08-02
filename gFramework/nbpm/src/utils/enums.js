/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nbpm/src/utils/enums
 * @description Provides shared nbpm utility exports for enums.
 * @layer utils
 * @owner nbpm
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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