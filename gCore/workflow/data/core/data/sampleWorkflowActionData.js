/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "sampleActionError",
        name: "sampleActionError",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.LEAF.key,
        handler: 'DefaultSampleWorkflowService.performErrorAction',
        userGroups: ['adminUserGroup'],
        allowedDecisions: ['ERROR']
    },

    record1: {
        code: "sampleActionSuccess",
        name: "sampleActionSuccess",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.LEAF.key,
        handler: 'DefaultSampleWorkflowService.performActionSuccess',
        userGroups: ['adminUserGroup'],
        allowedDecisions: ['SUCSESS', 'ERROR']
    },

    record2: {
        code: "sampleActionOne",
        name: "sampleActionOne",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultSampleWorkflowService.performActionOne',
        userGroups: ['adminUserGroup'],
        allowedDecisions: ['THREE', 'ERROR'],
        channels: ['threeChannel', 'sampleChannelError']
    },

    record3: {
        code: "sampleActionTwo",
        name: "sampleActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultSampleWorkflowService.performActionTwo',
        userGroups: ['adminUserGroup'],
        allowedDecisions: ['SUCCESS', 'ERROR'],
        channels: ['sampleChannelSuccess', 'sampleChannelError']
    },

    record4: {
        code: "sampleActionThree",
        name: "sampleActionThree",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultSampleWorkflowService.performActionThree',
        userGroups: ['adminUserGroup'],
        allowedDecisions: ['SUCCESS', 'ERROR'],
        channels: ['sampleChannelSuccess', 'sampleChannelError']
    }
};