/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    record0: {
        code: "defaultSuccessAction",
        name: "defaultSuccessAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'DefaultSuccessActionHandlerService.performDefaultSuccessAction',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
        allowedDecisions: ['SUCCESS']
    },
    // record0: {
    //     code: "defaultSuccessAction",
    //     name: "defaultSuccessAction",
    //     active: true,
    //     type: ENUMS.WorkflowActionType.MANUAL.key,
    //     position: ENUMS.WorkflowActionPosition.END.key,
    //     accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
    //     allowedDecisions: ['SUCCESS']
    // },
    record1: {
        code: "defaultRejectAction",
        name: "defaultRejectAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'DefaultRejectActionHandlerService.performDefaultRejectAction',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
        allowedDecisions: ['REJECT']
    },
    record2: {
        code: "defaultErrorAction",
        name: "defaultErrorAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'DefaultErrorActionHandlerService.performDefaultErrorAction',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
        allowedDecisions: ['ERROR']
    },
    record3: {
        code: "defaultSplitEndAction",
        name: "defaultSplitEndAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'defaultSplitEndActionHandlerService.performDefaultSplitEndAction',
        accessGroups: ['workflowUserGroup', 'employeeUserGroup'],
        allowedDecisions: ['SLIPTEND']
    }
};