/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
