/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/data/reconciliation/defaultStockReconciliationWorkflowChannelHeader @description Imports reconciliation channels into Workflow-owned schemas. @layer data @owner inventory */
module.exports = { workflow: { defaultStockReconciliationWorkflowChannel: { options: { enabled: true, schemaName: 'workflowChannel', operation: 'saveAll', dataFilePrefix: 'defaultStockReconciliationWorkflowChannelData' }, query: { code: '$code' } } } };
