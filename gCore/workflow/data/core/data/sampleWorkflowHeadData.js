/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "sampleWorkflow",
        name: "sampleWorkflow",
        active: true,
        type: ENUMS.WorkflowActionType.AUTO.key,
        handler: 'DefaultSampleWorkflowService.performHeadOperation',
        userGroups: ['adminUserGroup'],
        allowedDecisions: ['ONE', 'TWO'],
        channels: ['oneChannel', 'twoChannel']
    }
};