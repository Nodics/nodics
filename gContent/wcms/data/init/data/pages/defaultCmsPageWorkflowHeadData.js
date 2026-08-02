/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcms/data/init/data/pages/defaultCmsPageWorkflowHeadData
 * @description Seed workflow head action data that starts CMS page approval processing.
 * @layer data
 * @owner wcms
 * @override Project modules may replace page approval flow heads through later initializer data.
 */
module.exports = {

    record1: {
        code: "cmsPagesApprovalFlowHead",
        name: "cmsPagesApprovalFlowHead",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultWorkflowActionExecutionService.performHeadOperation',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['reviewCmsPageChannel']
    }
};
