/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample/data/components/sampleHeaderCmsComponentData
 * @description Sample header CMS component records used for demo or development data loading.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own header component samples rather than changing shared CMS samples.
 */
module.exports = {
    record0: {
        code: 'samplePageHeaderComponent',
        active: true,
        cmsPages: ['sampleHomePage', 'sampleProductDetailPage', 'sampleProductListingPage', 'sampleCartDetailPage'],
        typeCode: 'headerComponentType',
        subComponents: [{
            //source: 'samplePageHeaderComponent',
            target: 'sampleLogoComponent',
            active: true,
            index: 1
        }]
    },
    record1: {
        code: 'sampleLogoComponent',
        active: true,
        typeCode: 'logoComponentType',
        subComponents: [{
            //source: 'sampleLogoComponent',
            target: 'sampleLogoImageComponent',
            active: true,
            index: 1
        }, {
            //source: 'sampleLogoComponent',
            target: 'sampleLogoTextComponent',
            active: true,
            index: 2
        }, {
            //source: 'sampleLogoComponent',
            target: 'sampleLogoSubTextComponent',
            active: true,
            index: 3
        }]
    },
    record2: {
        code: 'sampleLogoImageComponent',
        active: true,
        typeCode: 'imageComponentType'
    },
    record3: {
        code: 'sampleLogoTextComponent',
        active: true,
        typeCode: 'textComponentType',
        logoTitle: 'Nodics'
    },
    record4: {
        code: 'sampleLogoSubTextComponent',
        active: true,
        typeCode: 'textComponentType',
        logoSubTitle: 'Nodics'
    },
};
