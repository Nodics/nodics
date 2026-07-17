/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/init/headers/content/defaultCmsTypeCodeDataHeader
 * @description Initial-data import header for default CMS type-code records.
 * @layer data
 * @owner cms
 * @override Project modules may supply later headers to change CMS type-code import behavior.
 */
module.exports = {
    cms: {
        defaultCmsTypeCodeData: {
            options: {
                enabled: true,
                schemaName: 'cmsTypeCode',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCmsTypeCodeData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
