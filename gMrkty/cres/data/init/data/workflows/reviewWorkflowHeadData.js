/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gMrkty/cres/data/init/data/workflows/reviewWorkflowHeadData
 * @description Provides cres initializer or sample data consumed by the import layer.
 * @layer data
 * @owner cres
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {

    record1: {
        code: "customerReviewsWorkflow",
        name: "customerReviewsWorkflow",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultWorkflowActionExecutionService.performHeadOperation',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['customerReviewHeadSuccess']
    }
};