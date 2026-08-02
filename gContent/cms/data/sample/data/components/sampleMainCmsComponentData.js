/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample/data/components/sampleMainCmsComponentData
 * @description Sample main-area CMS component records used for demo or development data loading.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own main component samples rather than changing shared CMS samples.
 */
module.exports = {
    record0: {
        code: 'samplePageMainComponent',
        name: 'samplePageMainComponent',
        active: true,
        cmsPages: ['sampleHomePage', 'sampleProductDetailPage', 'sampleProductListingPage', 'sampleCartDetailPage'],
        typeCode: 'mainComponentType'
    }
};
