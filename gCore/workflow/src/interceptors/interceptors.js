/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
    loadWorkflowItemActionResponses: {
        type: 'schema',
        item: 'workflowItem',
        trigger: 'postGet',
        active: 'true',
        index: 99,
        handler: 'DefaultWorkflowActionResponsesInterceptorService.loadActionResponseForWorkflowItem'
    },
    loadWorkflowArchivedItemActionResponses: {
        type: 'schema',
        item: 'workflowArchivedItem',
        trigger: 'postGet',
        active: 'true',
        index: 99,
        handler: 'DefaultWorkflowActionResponsesInterceptorService.loadActionResponseForWorkflowItem'
    },
    loadWorkflowErrorItemActionResponses: {
        type: 'schema',
        item: 'workflowErrorItem',
        trigger: 'postGet',
        active: 'true',
        index: 99,
        handler: 'DefaultWorkflowActionResponsesInterceptorService.loadActionResponseForWorkflowItem'
    }
};