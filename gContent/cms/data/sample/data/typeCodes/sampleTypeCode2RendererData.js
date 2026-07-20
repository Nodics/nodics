/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
