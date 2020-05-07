/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'workflowAdmin',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Admin',
        },
        loginId: 'workflowAdmin',
        password: {
            loginId: 'workflowAdmin',
            password: 'workflowAdmin',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbsdc835ff',
        userGroups: ['workflowCreaterGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record1: {
        code: 'workflowCreator',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Creator',
        },
        loginId: 'workflowCreator',
        password: {
            loginId: 'workflowCreator',
            password: 'workflowCreator',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbsdc835ff',
        userGroups: ['workflowCreaterGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record2: {
        code: 'workflowApprover',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Approver',
        },
        loginId: 'workflowApprover',
        password: {
            loginId: 'workflowApprover',
            password: 'workflowApprover',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbsdc345ff',
        userGroups: ['workflowApproverGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    }
};