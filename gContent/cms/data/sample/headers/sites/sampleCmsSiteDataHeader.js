/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/sample/headers/sites/sampleCmsSiteDataHeader
 * @description Sample import header for CMS site demo data.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own sample import headers when loading project-specific CMS sites.
 */
module.exports = {
    cms: {
        sampleCmsSiteData: {
            options: {
                enabled: true,
                schemaName: 'cmsSite',
                operation: 'saveAll',
                dataFilePrefix: 'sampleCmsSiteData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
