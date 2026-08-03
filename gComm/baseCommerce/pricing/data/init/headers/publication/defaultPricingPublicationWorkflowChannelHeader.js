/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/data/publication/DefaultPricingPublicationWorkflowChannelHeader @description Imports Pricing publication workflow channels through the existing init-data authority. @layer data @owner pricing */
module.exports = { workflow: { defaultPricingPublicationWorkflowChannel: { options: { enabled: true, schemaName: 'workflowChannel', operation: 'saveAll', dataFilePrefix: 'defaultPricingPublicationWorkflowChannelData' }, query: { code: '$code' } } } };
