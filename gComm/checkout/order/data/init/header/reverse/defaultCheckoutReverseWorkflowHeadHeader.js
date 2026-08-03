/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/reverse/defaultCheckoutReverseWorkflowHeadHeader @description Imports checkout reverse workflow heads into Workflow-owned schemas. @layer data @owner order */
module.exports = { workflow: { defaultCheckoutReverseWorkflowHead: { options: { enabled: true, schemaName: 'workflowAction', operation: 'saveAll', dataFilePrefix: 'defaultCheckoutReverseWorkflowHeadData' }, query: { code: '$code' } } } };
