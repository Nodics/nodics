/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/sample/headers/typeCodes/sampleTypeCode2RendererDataHeader
 * @description Sample import header for CMS type-code renderer mapping demo data.
 * @layer data
 * @owner cms
 * @override Project modules should provide their own sample import headers when loading project-specific renderer mappings.
 */
module.exports = {
    cms: {
        sampleTypeCode2RendererData: {
            options: {
                enabled: true,
                schemaName: 'cmsTypeCode2Renderer',
                operation: 'saveAll',
                dataFilePrefix: 'sampleTypeCode2RendererData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
