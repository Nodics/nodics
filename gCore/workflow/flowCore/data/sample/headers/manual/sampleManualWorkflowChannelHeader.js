/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/data/sample/headers/manual/sampleManualWorkflowChannelHeader
 * @description Provides workflow initializer or sample data consumed by the import layer.
 * @layer data
 * @owner workflow
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    workflow: {
        sampleManualWorkflowChannel: {
            options: {
                enabled: true,
                schemaName: 'workflowChannel',
                operation: 'saveAll',
                dataFilePrefix: 'sampleManualWorkflowChannelData'
            },
            query: {
                code: '$code'
            }
        }
    }
};