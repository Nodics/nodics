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
        workflowCarrierInitiated: {
            active: true,
            event: 'carrierInitiated',
            listener: 'DefaultWorkflowCarrierAssignedEventListenerService.handleWorkflowCarrierAssignedEvent'
        },
        workflowCarrierReleased: {
            active: true,
            event: 'carrierReleased',
            listener: 'DefaultWorkflowCarrierReleasedEventListenerService.handleWorkflowCarrierReleasedEvent'
        },
        workflowCarrierBlocked: {
            active: true,
            event: 'carrierBlocked',
            listener: 'DefaultWorkflowCarrierBlockedEventListenerService.handleWorkflowCarrierBlockedEvent'
        },
        workflowCarrierPaused: {
            active: true,
            event: 'carrierPaused',
            listener: 'DefaultWorkflowCarrierPausedEventListenerService.handleWorkflowCarrierPausedEvent'
        },
        workflowCarrierResumed: {
            active: true,
            event: 'carrierResumed',
            listener: 'DefaultWorkflowCarrierResumedEventListenerService.handleWorkflowCarrierResumedEvent'
        },
        workflowCarrierUpdated: {
            active: true,
            event: 'carrierUpdated',
            listener: 'DefaultWorkflowCarrierUpdatedEventListenerService.handleWorkflowCarrierUpdatedEvent'
        },
        workflowErrorOccurred: {
            active: true,
            event: 'errorOccurred',
            listener: 'DefaultWorkflowErrorOccuredEventListenerService.handleWorkflowErrorOccuredEvent'
        },
        // workflowChannelsEvaluated: {
        //     active: true,
        //     event: 'channelsEvaluated',
        //     listener: 'DefaultWorkflowChannelsEvaluatedEventListenerService.handleWorkflowChannelsEvaluatedEvent'
        // },
        workflowActionPerformed: {
            active: true,
            event: 'actionPerformed',
            listener: 'DefaultWorkflowActionPerformedEventListenerService.handleWorkflowActionPerformedEvent'
        },
        workflowCarrierProcessed: {
            active: true,
            event: 'carrierProcessed',
            listener: 'DefaultWorkflowCarrierProcessedEventListenerService.handleWorkflowCarrierProcessedEvent'
        },
        workflowCarrierFilled: {
            active: true,
            event: 'carrierFilled',
            listener: 'DefaultWorkflowCarrierFilledEventListenerService.handleWorkflowCarrierFilledEvent'
        }
    }
};