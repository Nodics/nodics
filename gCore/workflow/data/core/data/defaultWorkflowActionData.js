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
        handler: 'DefaultWorkflowActionService.handleSuccessProcess',
        userGroups: ['enployeeAdminGroup'],
        isLeafAction: true
    },

    record1: {
        code: "defaultErrorAction",
        name: "defaultErrorAction",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.END.key,
        handler: 'DefaultWorkflowActionService.handleErrorProcess',
        userGroups: ['enployeeAdminGroup'],
        isLeafAction: true
    }
};