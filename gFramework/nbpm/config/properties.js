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
        workflowCarrierAssigned: {
            active: true,
            event: 'itemAssigned',
            listener: 'DefaultWorkflowCarrierAssignedEventListenerService.handleWorkflowCarrierAssignedEvent'
        },
        workflowCarrierUpdated: {
            active: true,
            event: 'itemUpdated',
            listener: 'DefaultWorkflowCarrieUpdatedEventListenerService.handleWorkflowCarrierUpdatedEvent'
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
        workflowCarrierProcessed: {
            active: true,
            event: 'itemProcessed',
            listener: 'DefaultWorkflowCarrierProcessedEventListenerService.handleWorkflowCarrierProcessedEvent'
        },
        workflowCarrierPaused: {
            active: true,
            event: 'itemPaused',
            listener: 'DefaultWorkflowCarrierPausedEventListenerService.handleWorkflowCarrierPausedEvent'
        },
        workflowCarrierResumed: {
            active: true,
            event: 'itemResumed',
            listener: 'DefaultWorkflowCarrierResumedEventListenerService.handleWorkflowCarrierResumedEvent'
        }
    }
};