/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample/data/sites/sampleCmsSiteData
 * @description Sample CMS site records used for demo or development data loading.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own site samples rather than changing shared CMS samples.
 */
module.exports = {
    record0: {
        code: 'sampleContentCmsSite',
        name: 'sampleContentCmsSite',
        catalog: 'defaultContentCatalog',
        active: true,
    },
    record1: {
        code: 'sampleInCmsSite',
        name: 'sampleInCmsSite',
        catalog: 'inContentCatalog',
        active: true,
    },
    record2: {
        code: 'sampleUAECmsSite',
        name: 'sampleUAECmsSite',
        catalog: 'uaeContentCatalog',
        active: true
    },
    record3: {
        code: 'sampleDeCmsSite',
        name: 'sampleDeCmsSite',
        catalog: 'deContentCatalog',
        active: true
    }
};
