/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module pricing/data/publication/DefaultPricingPublicationWorkflowChannelHeader @description Imports Pricing publication workflow channels through the existing init-data authority. @layer data @owner pricing */
module.exports = { workflow: { defaultPricingPublicationWorkflowChannel: { options: { enabled: true, schemaName: 'workflowChannel', operation: 'saveAll', dataFilePrefix: 'defaultPricingPublicationWorkflowChannelData' }, query: { code: '$code' } } } };
