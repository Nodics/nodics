/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "multiActionOne",
        name: "multiActionOne",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['multiSuccessChannel']
    },
    record1: {
        code: "multiActionTwo",
        name: "multiActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SPLIT'],
        channels: ['multiSplitOneChannel', 'multiSplitTowChannel']
    },
    record2: {
        code: "multiSplitActionOne",
        name: "multiSplitActionOne",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'],
        channels: ['defaultSuccessChannel', 'defaultRejectChannel', 'defaultErrorChannel']
    },
    record3: {
        code: "multiSplitActionTwo",
        name: "multiSplitActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['MultiSplitReject', 'SUCCESS', 'REJECT', 'ERROR'],
        channels: ['multiSplitTowRejectChannel', 'defaultSuccessChannel', 'defaultRejectChannel', 'defaultErrorChannel']
    }
};