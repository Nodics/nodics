/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcms/data/init/data/components/defaultCmsComponentWorkflowHeadData
 * @description Seed workflow head action data that starts CMS component approval processing.
 * @layer data
 * @owner wcms
 * @override Project modules may replace component approval flow heads through later initializer data.
 */
module.exports = {

    record1: {
        code: "cmsComponentApprovalFlowHead",
        name: "cmsComponentApprovalFlowHead",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultWorkflowActionExecutionService.performHeadOperation',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['reviewCmsComponentChannel']
    }
};
