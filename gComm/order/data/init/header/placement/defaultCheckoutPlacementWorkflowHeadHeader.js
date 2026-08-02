/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module order/data/placement/defaultCheckoutPlacementWorkflowHeadHeader @description Imports checkout placement workflow heads into Workflow-owned schemas. @layer data @owner order */
module.exports = { workflow: { defaultCheckoutPlacementWorkflowHead: { options: { enabled: true, schemaName: 'workflowAction', operation: 'saveAll', dataFilePrefix: 'defaultCheckoutPlacementWorkflowHeadData' }, query: { code: '$code' } } } };
