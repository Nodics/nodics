/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nValidator/data/init/headers/validator/defaultSampleValidatorHeader
 * @description Provides nValidator initializer or sample data consumed by the import layer.
 * @layer data
 * @owner nValidator
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    validator: {
        defaultSampleValidator: {
            options: {
                enabled: true,
                schemaName: 'validator',
                operation: 'saveAll',
                dataFilePrefix: 'defaultSampleValidatorData'
            },
            query: {
                code: '$code'
            }
        }
    }
};