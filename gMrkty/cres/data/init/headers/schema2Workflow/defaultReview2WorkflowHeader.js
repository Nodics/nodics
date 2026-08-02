/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gMrkty/cres/data/init/headers/schema2Workflow/defaultReview2WorkflowHeader
 * @description Provides cres initializer or sample data consumed by the import layer.
 * @layer data
 * @owner cres
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    cres: {
        defaultReview2Workflow: {
            options: {
                enabled: true,
                schemaName: 'workflow2Schema',
                operation: 'saveAll',
                dataFilePrefix: 'defaultReview2WorkflowData'
            },
            query: {
                workflowCode: '$workflowCode',
                schemaName: '$schemaName'
            }
        }
    }
};