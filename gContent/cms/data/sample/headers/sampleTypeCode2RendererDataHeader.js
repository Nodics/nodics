/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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