/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
