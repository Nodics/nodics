/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/data/init/headers/pages/defaultCmsPageWorkflowHeadHeader
 * @description Import header for saving the default CMS page workflow head record.
 * @layer data
 * @owner wcms
 * @override Project modules may add later headers when page workflow head import behavior changes.
 */
module.exports = {
    workflow: {
        defaultCmsPageWorkflowHead: {
            options: {
                enabled: true,
                schemaName: 'workflowAction',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCmsPageWorkflowHeadData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
