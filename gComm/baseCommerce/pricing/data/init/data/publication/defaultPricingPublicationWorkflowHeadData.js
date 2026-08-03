/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/data/publication/DefaultPricingPublicationWorkflowHeadData @description Seeds independently selectable manual and automatic Pricing publication workflow heads. @layer data @owner pricing */
module.exports = {
    manual: { code: 'pricingPublicationManualFlow', name: 'Pricing Publication Manual Approval', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup', 'employeeUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['pricingPublicationManualReviewChannel'] },
    automatic: { code: 'pricingPublicationAutomaticFlow', name: 'Pricing Publication Automatic Approval', active: true, type: ENUMS.WorkflowActionType.AUTO.key, position: ENUMS.WorkflowActionPosition.HEAD.key, handler: 'DefaultWorkflowActionExecutionService.performHeadOperation', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS'], channels: ['pricingPublicationAutomaticPublishChannel'] }
};
