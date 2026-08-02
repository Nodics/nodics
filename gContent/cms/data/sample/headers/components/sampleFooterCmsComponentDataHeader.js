/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
