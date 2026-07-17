/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/src/interceptors/interceptors
 * @description Registers workflow interceptor wiring for pipeline extension points.
 * @layer interceptors
 * @owner workflow
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    preSaveWorkflowAction: {
        type: 'schema',
        item: 'workflowAction',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSaveWorkflowActionInterceptorService.handlePreSaveAction'
    },
    loadWorkflowCarrierActionResponses: {
        type: 'schema',
        item: 'workflowCarrier',
        trigger: 'postGet',
        active: 'true',
        index: 99,
        handler: 'DefaultWorkflowActionResponsesInterceptorService.loadActionResponseForWorkflowCarrier'
    },
    loadWorkflowArchivedCarrierActionResponses: {
        type: 'schema',
        item: 'workflowArchivedCarrier',
        trigger: 'postGet',
        active: 'true',
        index: 99,
        handler: 'DefaultWorkflowActionResponsesInterceptorService.loadActionResponseForWorkflowCarrier'
    },
    loadWorkflowErrorItemActionResponses: {
        type: 'schema',
        item: 'workflowErrorCarrier',
        trigger: 'postGet',
        active: 'true',
        index: 99,
        handler: 'DefaultWorkflowActionResponsesInterceptorService.loadActionResponseForWorkflowCarrier'
    }
};