/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/sample/headers/typeCodes/sampleTypeCodeDataHeader
 * @description Sample import header for CMS type-code demo data.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own sample import headers when loading project-specific CMS type codes.
 */
module.exports = {
    cms: {
        sampleTypeCodeData: {
            options: {
                enabled: true,
                schemaName: 'cmsTypeCode',
                operation: 'saveAll',
                dataFilePrefix: 'sampleTypeCodeData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
