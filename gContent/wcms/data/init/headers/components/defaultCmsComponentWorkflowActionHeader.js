/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
