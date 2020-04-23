/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "multiActionSuccess",
        name: "multiActionSuccess",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'DefaultSampleWorkflowService.performActionThree',
        accessGroups: ['workflowUserGroup']
    },
    record1: {
        code: "multiActionOne",
        name: "multiActionOne",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['multiSuccessChannel']
    },
    record2: {
        code: "multiActionTwo",
        name: "multiActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SPLIT'],
        channels: ['multiSplitOneChannel', 'multiSplitTowChannel']
    },
    record3: {
        code: "multiSplitActionOne",
        name: "multiSplitActionOne",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['multiSuccessChannel']
    },
    record4: {
        code: "multiSplitActionTwo",
        name: "multiSplitActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'MultiSplitReject'],
        channels: ['multiSuccessChannel', 'multiSplitTowRejectChannel']
    }
};