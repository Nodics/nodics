/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gframes/gframesModules/gfcms/data/core/headers/sites/grayFramesCmsSiteDataHeader
 * @description Provides gframesModules initializer or sample data consumed by the import layer.
 * @layer data
 * @owner gframesModules
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    cms: {
        grCmsSiteData: {
            options: {
                enabled: true,
                schemaName: 'cmsSite',
                operation: 'saveAll',
                dataFilePrefix: 'grayFramesCmsSiteData'
            },
            query: {
                code: '$code'
            }
        }
    }
};