/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
