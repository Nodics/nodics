/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/data/init/data/user/defaultWorkflowEmployeeData
 * @description Provides workflow initializer or sample data consumed by the import layer.
 * @layer data
 * @owner workflow
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
const crypto = require('crypto');

module.exports = {
    record0: {
        code: 'workflowAdmin',
        active: false,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Admin',
        },
        loginId: 'workflowAdmin',
        password: {
            loginId: 'workflowAdmin',
            password: crypto.randomBytes(32).toString('base64url'),
            active: true
        },
        principalType: 'human',
        userGroups: ['workflowCreaterGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record1: {
        code: 'workflowCreator',
        active: false,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Creator',
        },
        loginId: 'workflowCreator',
        password: {
            loginId: 'workflowCreator',
            password: crypto.randomBytes(32).toString('base64url'),
            active: true
        },
        principalType: 'human',
        userGroups: ['workflowCreaterGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record2: {
        code: 'workflowApprover',
        active: false,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Approver',
        },
        loginId: 'workflowApprover',
        password: {
            loginId: 'workflowApprover',
            password: crypto.randomBytes(32).toString('base64url'),
            active: true
        },
        principalType: 'human',
        userGroups: ['workflowApproverGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    }
};
