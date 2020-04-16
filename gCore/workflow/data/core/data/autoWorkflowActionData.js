/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    record0: {
        code: "autoActionOne",
        name: "autoActionOne",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultSampleWorkflowService.performActionOne',
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['AUTOTHREE'],
        channels: ['autoThreeChannel']
    },
    record1: {
        code: "autoActionTwo",
        name: "autoActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultSampleWorkflowService.performActionTwo',
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['autoSuccessChannel']
    },
    record2: {
        code: "autoActionThree",
        name: "autoActionThree",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultSampleWorkflowService.performActionThree',
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['autoSuccessChannel']
    },
    record3: {
        code: "autoActionSuccess",
        name: "autoActionSuccess",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'DefaultSampleWorkflowService.performActionSuccess',
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
    }
};