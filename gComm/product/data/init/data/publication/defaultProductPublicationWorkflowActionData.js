/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module product/data/publication/DefaultProductPublicationWorkflowActionData @description Seeds manual review and automatic nPublish actions for Product releases. @layer data @owner product */
module.exports = {
    manualReview: { code: 'productPublicationManualReviewAction', name: 'Review Product Publication', active: true, type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'], channels: ['productPublicationApprovedPublishChannel', 'defaultRejectChannel', 'defaultErrorChannel'] },
    publish: { code: 'productPublicationPublishAction', name: 'Publish Approved Product', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultProductPublicationWorkflowService.publish', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] }
};
