/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
        active: true,
    },
    record1: {
        code: 'sampleProductDetailPageType',
        active: true
    },
    record2: {
        code: 'sampleProductListingPageType',
        active: true
    },
    record3: {
        code: 'sampleCartDetailPageType',
        active: true
    }
};
