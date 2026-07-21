/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module product/data/publication/DefaultProductPublicationWorkflowHeadHeader @description Imports Product publication Workflow heads through existing init-data authority. @layer data @owner product */
module.exports = { workflow: { defaultProductPublicationWorkflowHead: { options: { enabled: true, schemaName: 'workflowAction', operation: 'saveAll', dataFilePrefix: 'defaultProductPublicationWorkflowHeadData' }, query: { code: '$code' } } } };
