/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nValidator/data/init/data/validator/defaultSampleValidatorData
 * @description Provides nValidator initializer or sample data consumed by the import layer.
 * @layer data
 * @owner nValidator
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        code: 'sampleDefaultValidator',
        type: 'schema',
        //item: 'customer', // not required, because it should be common
        trigger: 'preSave',
        active: true,
        index: 0,
        handler: 'DefaultSampleValidatorService.handlePreSave'
    },

    record1: {
        code: 'sampleAddressValidator',
        type: 'schema',
        item: 'address', // not required, because it should be common
        trigger: 'preSave',
        active: true,
        index: 0,
        handler: 'DefaultSampleValidatorService.handlePreAddressSave'
    }
};