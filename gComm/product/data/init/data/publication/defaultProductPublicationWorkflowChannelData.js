/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module product/data/publication/DefaultProductPublicationWorkflowChannelData @description Routes manual and automatic Product approval paths into one nPublish action. @layer data @owner product */
module.exports = {
    manualReview: { code: 'productPublicationManualReviewChannel', name: 'Product Publication Manual Review', active: true, qualifier: { decision: 'SUCCESS' }, target: 'productPublicationManualReviewAction' },
    approvedPublish: { code: 'productPublicationApprovedPublishChannel', name: 'Product Publication Approved Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'productPublicationPublishAction' },
    automaticPublish: { code: 'productPublicationAutomaticPublishChannel', name: 'Product Publication Automatic Publish', active: true, qualifier: { decision: 'SUCCESS' }, target: 'productPublicationPublishAction' }
};
