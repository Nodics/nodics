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
        isCarrierReleased: true,
        defaultCarrierType: 'FIXED',
        carrierCodeStrategy2Hnadler: {
            DEFAULT: 'DefaultCarrierCodeGeneratorService',
            GROUPINTIME: 'DefaultDurationalCarrierCodeGeneratorService'
        }
    },
    defaultWorkflowConfig: {
        sourceBuilder: {
            itemBuilder: 'DefaultSourceItemDataBuilderService',
            carrierBuilder: 'DefaultSourceCarrierDataBuilderService',
            codeStrategy: {
                params: {
                    pattern: 'YYYY_MM_DD_HH_MM_SS',
                    delimiter: '_'
                }
            }
        },
        events: {
            workflowCarrierAssigned: {//
                active: true,
                event: 'carrierAssigned',
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
            workflowCarrierUpdated: {//
                active: true,
                event: 'carrierUpdated',
                listener: 'DefaultWorkflowCarrierUpdatedEventListenerService.handleWorkflowCarrierUpdatedEvent'
            },
            workflowErrorOccurred: {//
                active: true,
                event: 'errorOccurred',
                listener: 'DefaultWorkflowErrorOccuredEventListenerService.handleWorkflowErrorOccuredEvent'
            },
            workflowChannelsEvaluated: {//
                active: true,
                event: 'channelsEvaluated',
                listener: 'DefaultWorkflowChannelsEvaluatedEventListenerService.handleWorkflowChannelsEvaluatedEvent'
            },
            workflowActionPerformed: {//
                active: true,
                event: 'actionPerformed',
                listener: 'DefaultWorkflowActionPerformedEventListenerService.handleWorkflowActionPerformedEvent'
            },
            workflowCarrierProcessed: {//
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
    }
};