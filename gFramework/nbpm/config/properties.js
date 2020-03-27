/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    defaultErrorCodes: {
        WorkflowError: 'ERR_WF_00000'
    },

    defaultWorkflowEvents: {
        workflowItemAssigned: {
            enabled: true,
            event: 'itemAssigned',
            listener: 'DefaultWorkflowItemAssignedEventListenerService.handleWorkflowItemAssignedEvent'
        },
        workflowErrorOccurred: {
            enabled: true,
            event: 'errorOccurred',
            listener: 'DefaultWorkflowErrorOccurredEventListenerService.handleWorkflowErrorOccurredEvent'
        },
        workflowChannelsEvaluated: {
            enabled: true,
            event: 'channelsEvaluated',
            listener: 'DefaultWorkflowChannelsEvaluatedEventListenerService.handleWorkflowChannelsEvaluatedEvent'
        },
        workflowActionPerformed: {
            enabled: true,
            event: 'actionPerformed',
            listener: 'DefaultWorkflowActionPerformedEventListenerService.handleWorkflowActionPerformedEvent'
        },
        workflowItemProcessed: {
            enabled: true,
            event: 'itemProcessed',
            listener: 'DefaultWorkflowItemProcessedEventListenerService.handleWorkflowItemProcessedEvent'
        }
    }
};