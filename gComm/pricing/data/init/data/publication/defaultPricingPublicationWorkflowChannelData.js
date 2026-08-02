/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/data/publication/DefaultPricingPublicationWorkflowChannelData @description Routes manual and automatic Pricing approval paths into the same nPublish action. @layer data @owner pricing */
module.exports = {
    manualReview: { code: 'pricingPublicationManualReviewChannel', name: 'Pricing Publication Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'pricingPublicationManualReviewAction' },
    approvedPublish: { code: 'pricingPublicationApprovedPublishChannel', name: 'Pricing Publication Approved Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'pricingPublicationPublishAction' },
    automaticPublish: { code: 'pricingPublicationAutomaticPublishChannel', name: 'Pricing Publication Automatic Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'pricingPublicationPublishAction' }
};
