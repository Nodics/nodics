/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
