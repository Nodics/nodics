/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/data/publication/DefaultProductPublicationWorkflowActionHeader @description Imports Product publication Workflow actions through existing init-data authority. @layer data @owner product */
module.exports = { workflow: { defaultProductPublicationWorkflowAction: { options: { enabled: true, schemaName: 'workflowAction', operation: 'saveAll', dataFilePrefix: 'defaultProductPublicationWorkflowActionData' }, query: { code: '$code' } } } };
