/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    preSaveWorkflowCarrierState: {
        type: 'schema',
        item: 'workflowCarrierState',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSaveWorkflowCarrierStateInterceptorService.handlePreSaveState'
    },
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