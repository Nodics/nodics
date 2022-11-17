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
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['manualTwo'],
        channels: ['manualTwoChannel']
    },
    record1: {
        code: "manualActionTwo",
        name: "manualActionTwo",
        active: true,
        type: ENUMS.WorkflowActionType.MANUAL.key,
        accessGroups: ['workflowUserGroup'],
        allowedDecisions: ['SUCCESS', 'REJECT', 'ERROR'],
        channels: ['defaultSuccessChannel', 'defaultRejectChannel', 'defaultErrorChannel']
    }
};