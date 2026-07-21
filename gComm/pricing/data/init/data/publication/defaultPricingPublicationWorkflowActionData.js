/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module pricing/data/publication/DefaultPricingPublicationWorkflowActionData @description Seeds manual review plus shared automatic nPublish actions for Pricing releases. @layer data @owner pricing */
module.exports = {
    manualReview: { code: 'pricingPublicationManualReviewAction', name: 'Review Pricing Publication', active: true, type: ENUMS.WorkflowActionType.MANUAL.key, accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'], channels: ['pricingPublicationApprovedPublishChannel', 'defaultRejectChannel', 'defaultErrorChannel'] },
    publish: { code: 'pricingPublicationPublishAction', name: 'Publish Approved Pricing', active: true, type: ENUMS.WorkflowActionType.AUTO.key, handler: 'DefaultPricingPublicationWorkflowService.publish', accessGroups: ['workflowUserGroup'], allowedDecisions: ['SUCCESS', 'ERROR'], channels: ['defaultSuccessChannel', 'defaultErrorChannel'] }
};
