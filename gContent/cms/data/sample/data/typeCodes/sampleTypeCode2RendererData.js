/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample/data/typeCodes/sampleTypeCode2RendererData
 * @description Sample CMS type-code to renderer mapping records used for demo or development data loading.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own renderer mapping samples rather than changing shared CMS samples.
 */
module.exports = {
    record0: {
        code: 'sampleHomePageType',
        active: true,
        renderer: 'page.home'
    },
    record1: {
        code: 'sampleProductDetailPageType',
        active: true,
        renderer: 'page.product-detail'
    },
    record2: {
        code: 'sampleProductListingPageType',
        active: true,
        renderer: 'page.product-listing'
    },
    record3: {
        code: 'sampleCartDetailPageType',
        active: true,
        renderer: 'page.cart-detail'
    },
    record4: {
        code: 'headerComponentType',
        active: true,
        renderer: 'component.header'
    }
};
