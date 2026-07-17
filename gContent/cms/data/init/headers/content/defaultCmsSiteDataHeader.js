/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/init/headers/content/defaultCmsSiteDataHeader
 * @description Initial-data import header for default CMS site records.
 * @layer data
 * @owner cms
 * @override Project modules may supply later headers to change CMS site import behavior.
 */
module.exports = {
    cms: {
        defaultCmsSiteData: {
            options: {
                enabled: true,
                schemaName: 'cmsSite',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCmsSiteData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
