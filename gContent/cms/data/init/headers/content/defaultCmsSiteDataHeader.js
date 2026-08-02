/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
