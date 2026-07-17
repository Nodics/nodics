/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/sample/headers/components/sampleFooterCmsComponentDataHeader
 * @description Sample import header for footer CMS component demo data.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own sample import headers when loading project-specific footer components.
 */
module.exports = {
    cms: {
        sampleFooterCmsComponentData: {
            options: {
                enabled: true,
                schemaName: 'cmsComponent',
                operation: 'saveAll',
                dataFilePrefix: 'sampleFooterCmsComponentData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
