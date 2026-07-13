/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/data/init/headers/components/defaultCmsComponentWorkflowActionHeader
 * @description Import header for saving default CMS component workflow action records.
 * @layer data
 * @owner wcms
 * @override Project modules may add later headers when component workflow action import behavior changes.
 */
module.exports = {
    workflow: {
        defaultCmsComponentWorkflowAction: {
            options: {
                enabled: true,
                schemaName: 'workflowAction',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCmsComponentWorkflowActionData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
