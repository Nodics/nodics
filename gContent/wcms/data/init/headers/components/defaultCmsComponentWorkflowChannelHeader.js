/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/data/init/headers/components/defaultCmsComponentWorkflowChannelHeader
 * @description Import header for saving default CMS component workflow channel records.
 * @layer data
 * @owner wcms
 * @override Project modules may add later headers when component workflow channel import behavior changes.
 */
module.exports = {
    workflow: {
        defaultCmsComponentWorkflowChannel: {
            options: {
                enabled: true,
                schemaName: 'workflowChannel',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCmsComponentWorkflowChannelData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
