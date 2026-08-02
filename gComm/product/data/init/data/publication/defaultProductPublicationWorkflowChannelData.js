/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/data/publication/DefaultProductPublicationWorkflowChannelData @description Routes manual and automatic Product approval paths into one nPublish action. @layer data @owner product */
module.exports = {
    manualReview: { code: 'productPublicationManualReviewChannel', name: 'Product Publication Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'productPublicationManualReviewAction' },
    approvedPublish: { code: 'productPublicationApprovedPublishChannel', name: 'Product Publication Approved Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'productPublicationPublishAction' },
    automaticPublish: { code: 'productPublicationAutomaticPublishChannel', name: 'Product Publication Automatic Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'productPublicationPublishAction' }
};
