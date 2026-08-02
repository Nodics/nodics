/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample/headers/components/sampleMainCmsComponentDataHeader
 * @description Sample import header for main-area CMS component demo data.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own sample import headers when loading project-specific main components.
 */
module.exports = {
    cms: {
        sampleMainCmsComponentData: {
            options: {
                enabled: true,
                schemaName: 'cmsComponent',
                operation: 'saveAll',
                dataFilePrefix: 'sampleMainCmsComponentData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
