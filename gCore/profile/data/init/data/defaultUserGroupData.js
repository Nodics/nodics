/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'adminGroup',
        name: 'adminGroup',
        active: true
    },
    record1: {
        code: 'userGroup',
        name: 'userGroup',
        active: true,
        parentGroups: ['adminGroup']
    },
    record2: {
        code: 'employeeUserGroup',
        name: 'employeeUserGroup',
        active: true,
        parentGroups: ['userGroup']
    },
    record3: {
        code: 'employeeUserGroup',
        name: 'employeeUserGroup',
        active: true,
        parentGroups: ['userGroup']
    },
    record4: {
        code: 'contentUserGroup',
        name: 'contentUserGroup',
        active: true,
        parentGroups: ['adminGroup']
    },
    record5: {
        code: 'contentCreatorUserGroup',
        name: 'contentCreatorUserGroup',
        active: true,
        parentGroups: ['contentUserGroup']
    },
    record6: {
        code: 'contentApproverUserGroup',
        name: 'contentApproverUserGroup',
        active: true,
        parentGroups: ['contentUserGroup']
    }
};