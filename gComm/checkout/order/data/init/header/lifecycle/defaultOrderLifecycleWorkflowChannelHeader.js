/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/lifecycle/defaultOrderLifecycleWorkflowChannelHeader @description Imports lifecycle request Workflow channels into Workflow-owned schemas. @layer data @owner order */
module.exports = { workflow: { defaultOrderLifecycleWorkflowChannel: { options: { enabled: true, schemaName: 'workflowChannel', operation: 'saveAll', dataFilePrefix: 'defaultOrderLifecycleWorkflowChannelData' }, query: { code: '$code' } } } };
