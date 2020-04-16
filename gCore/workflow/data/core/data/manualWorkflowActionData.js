/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    record0: {
        code: "manualActionOne",
        name: "manualActionOne",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['MTHREE'],
        channels: ['manualThreeChannel']
    },

    record1: {
        code: "manualActionTwo",
        name: "manualActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['manualSuccessChannel']
    },

    record2: {
        code: "manualActionThree",
        name: "manualActionThree",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
        channels: ['manualSuccessChannel']
    },

    record3: {
        code: "manualActionSuccess",
        name: "manualActionSuccess",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'DefaultSampleWorkflowService.performActionThree',
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS'],
    }
};