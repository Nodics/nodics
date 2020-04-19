/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "autoWorkflow",
        name: "autoWorkflow",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        position: ENUMS.WorkflowActionPosition.HEAD.key,
        handler: 'DefaultSampleWorkflowService.performHeadOperation',
        userGroups: ['workflowUserGroup'],
        allowedDecisions: ['AUTOONE', 'AUTOTWO'],
        channels: ['autoOneChannel', 'autoTwoChannel']
    }
};