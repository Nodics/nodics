/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module product/data/publication/DefaultProductPublicationWorkflowHeadData @description Seeds independently selectable manual and automatic Product publication workflow heads. @layer data @owner product */
module.exports = {
    manual: { code: 'productPublicationManualFlow', name: 'Product Publication Manual Approval', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['productPublicationManualReviewChannel'] },
    automatic: { code: 'productPublicationAutomaticFlow', name: 'Product Publication Automatic Approval', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['productPublicationAutomaticPublishChannel'] }
};
