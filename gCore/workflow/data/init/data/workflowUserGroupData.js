/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'workflowUserGroup',
        name: 'workflowUserGroup',
        active: true,
        parentGroups: ['adminGroup']
    },
    record1: {
        code: 'workflowCreaterGroup',
        name: 'workflowCreaterGroup',
        active: true,
        parentGroups: ['workflowUserGroup']
    },
    record2: {
        code: 'workflowApproverGroup',
        name: 'workflowApproverGroup',
        active: true,
        parentGroups: ['workflowUserGroup']
    }
};