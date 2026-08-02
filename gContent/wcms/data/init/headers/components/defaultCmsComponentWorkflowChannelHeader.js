/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
