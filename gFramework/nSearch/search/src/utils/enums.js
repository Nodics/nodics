/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/utils/enums
 * @description Provides shared nSearch utility exports for enums.
 * @layer utils
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    IndexerType: {
        _options: {
            name: 'IndexerType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'INTERNAL',
            'EXTERNAL'
        ]
    },

    IndexerState: {
        _options: {
            name: 'IndexerState',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'NEW',
            'RUNNING',
            'SUCCESS',
            'ERROR'
        ]
    }
};