/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/data/placement/defaultCheckoutPlacementWorkflowChannelHeader @description Imports checkout placement workflow channels into Workflow-owned schemas. @layer data @owner order */
module.exports = { workflow: { defaultCheckoutPlacementWorkflowChannel: { options: { enabled: true, schemaName: 'workflowChannel', operation: 'saveAll', dataFilePrefix: 'defaultCheckoutPlacementWorkflowChannelData' }, query: { code: '$code' } } } };
