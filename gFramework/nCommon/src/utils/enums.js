/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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