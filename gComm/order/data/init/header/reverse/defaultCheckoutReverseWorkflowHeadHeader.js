/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module order/data/reverse/defaultCheckoutReverseWorkflowHeadHeader @description Imports checkout reverse workflow heads into Workflow-owned schemas. @layer data @owner order */
module.exports = { workflow: { defaultCheckoutReverseWorkflowHead: { options: { enabled: true, schemaName: 'workflowAction', operation: 'saveAll', dataFilePrefix: 'defaultCheckoutReverseWorkflowHeadData' }, query: { code: '$code' } } } };
