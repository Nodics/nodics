/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module pricing/data/publication/DefaultPricingPublicationWorkflowChannelData @description Routes manual and automatic Pricing approval paths into the same nPublish action. @layer data @owner pricing */
module.exports = {
    manualReview: { code: 'pricingPublicationManualReviewChannel', name: 'Pricing Publication Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'pricingPublicationManualReviewAction' },
    approvedPublish: { code: 'pricingPublicationApprovedPublishChannel', name: 'Pricing Publication Approved Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'pricingPublicationPublishAction' },
    automaticPublish: { code: 'pricingPublicationAutomaticPublishChannel', name: 'Pricing Publication Automatic Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'pricingPublicationPublishAction' }
};
