/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample/data/typeCodes/sampleTypeCodeData
 * @description Sample CMS type-code records used for demo or development data loading.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own type-code samples rather than changing shared CMS samples.
 */
module.exports = {
    record0: {
        code: 'sampleHomePageType',
        kind: 'PAGE',
        active: true,
    },
    record1: {
        code: 'sampleProductDetailPageType',
        kind: 'PAGE',
        active: true
    },
    record2: {
        code: 'sampleProductListingPageType',
        kind: 'PAGE',
        active: true
    },
    record3: {
        code: 'sampleCartDetailPageType',
        kind: 'PAGE',
        active: true
    }
};
