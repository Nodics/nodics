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
    workflow: {
        sourceItemBuilder: {
            serviceName: 'DefaultSourceItemDataBuilderService',
            operation: 'getSourceItemInfo'
        }
    },
    defaultWorkflowEvents: {
        workflowItemAssigned: {
            active: true,
            event: 'itemAssigned',
            listener: 'DefaultWorkflowItemAssignedEventListenerService.handleWorkflowItemAssignedEvent'
        },
        workflowErrorOccurred: {
            active: true,
            event: 'errorOccurred',
            listener: 'DefaultWorkflowErrorOccurredEventListenerService.handleWorkflowErrorOccurredEvent'
        },
        workflowChannelsEvaluated: {
            active: true,
            event: 'channelsEvaluated',
            listener: 'DefaultWorkflowChannelsEvaluatedEventListenerService.handleWorkflowChannelsEvaluatedEvent'
        },
        workflowActionPerformed: {
            active: true,
            event: 'actionPerformed',
            listener: 'DefaultWorkflowActionPerformedEventListenerService.handleWorkflowActionPerformedEvent'
        },
        workflowItemProcessed: {
            active: true,
            event: 'itemProcessed',
            listener: 'DefaultWorkflowItemProcessedEventListenerService.handleWorkflowItemProcessedEvent'
        },
        workflowItemPaused: {
            active: true,
            event: 'itemPaused',
            listener: 'DefaultWorkflowItemPausedEventListenerService.handleWorkflowItemPausedEvent'
        },
        workflowItemResumed: {
            active: true,
            event: 'itemResumed',
            listener: 'DefaultWorkflowItemResumedEventListenerService.handleWorkflowItemResumedEvent'
        }
    }
};