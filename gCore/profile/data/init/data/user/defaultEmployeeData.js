/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'admin',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'Nodics',
            lastName: 'Employee',
        },
        loginId: 'admin',
        password: {
            loginId: 'admin',
            password: 'nodics',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbb3c81bfg',
        userGroups: ['employeeUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record1: {
        code: 'apiAdmin',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'apiAdmin',
            lastName: 'Employee',
        },
        loginId: 'apiAdmin',
        password: {
            loginId: 'apiAdmin',
            password: 'apiAdminInternalEmployee',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbb3c81bff',
        userGroups: ['employeeUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record2: {
        code: 'contentCreator',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'Content',
            lastName: 'Creator',
        },
        loginId: 'contentCreator',
        password: {
            loginId: 'contentCreator',
            password: 'contentCreator',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbb3c835ff',
        userGroups: ['contentCreatorUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record3: {
        code: 'contentApprover',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'Content',
            lastName: 'Approver',
        },
        loginId: 'contentApprover',
        password: {
            loginId: 'contentApprover',
            password: 'contentApprover',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbsdc835ff',
        userGroups: ['contentApproverUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    }
};