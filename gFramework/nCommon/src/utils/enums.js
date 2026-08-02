/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCommon/utils/enums
 * @description Shared enum definitions for event targeting and configurable interceptor domains. nConfig converts these definitions into runtime Enum instances during startup.
 * @layer utility
 * @owner nCommon
 * @override Later modules may extend enum definitions through layered `src/utils/enums.js` contributions without modifying nCommon.
 */
module.exports = {
    TargetType: {
        _options: {
            name: 'TargetType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'EXTERNAL',
            'EACH_MODULE_NODES',// Publish to all nodes in each modules
            'EACH_MODULE', // publish to each modules
            'MODULE_NODES', // publish to each nodes for the module
            'MODULE' // publish to a module
        ]
    },

    InterceptorType: {
        _options: {
            name: 'InterceptorType',
            separator: '|',
            endianness: 'BE',
            ignoreCase: false,
            freez: false
        },
        definition: [
            'schema',
            'import',
            'export',
            'search',
            'workflow',
            'job'
        ]
    }
};
