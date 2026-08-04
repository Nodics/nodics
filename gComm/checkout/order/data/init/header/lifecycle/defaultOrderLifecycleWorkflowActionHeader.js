/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/lifecycle/defaultOrderLifecycleWorkflowActionHeader @description Imports lifecycle request Workflow actions into Workflow-owned schemas. @layer data @owner order */
module.exports = { workflow: { defaultOrderLifecycleWorkflowAction: { options: { enabled: true, schemaName: 'workflowAction', operation: 'saveAll', dataFilePrefix: 'defaultOrderLifecycleWorkflowActionData' }, query: { code: '$code' } } } };
