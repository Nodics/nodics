/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/init/data/user/defaultCmsEmployeeData
 * @description Default CMS employee records loaded by the CMS initial-data importer.
 * @layer data
 * @owner cms
 * @override Project modules may provide later CMS employee data contributions for project-specific users.
 */
const crypto = require('crypto');

module.exports = {
    record0: {
        code: 'contentManager',
        active: false,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Admin',
        },
        loginId: 'contentManager',
        password: {
            loginId: 'contentManager',
            password: crypto.randomBytes(32).toString('base64url'),
            active: true
        },
        principalType: 'human',
        userGroups: ['contentManagerGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record1: {
        code: 'contentCreator',
        active: false,
        name: {
            title: 'Mr.',
            firstName: 'Content',
            lastName: 'Creator',
        },
        loginId: 'contentCreator',
        password: {
            loginId: 'contentCreator',
            password: crypto.randomBytes(32).toString('base64url'),
            active: true
        },
        principalType: 'human',
        userGroups: ['contentCreaterGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record2: {
        code: 'contentApprover',
        active: false,
        name: {
            title: 'Mr.',
            firstName: 'Content',
            lastName: 'Approver',
        },
        loginId: 'contentApprover',
        password: {
            loginId: 'contentApprover',
            password: crypto.randomBytes(32).toString('base64url'),
            active: true
        },
        principalType: 'human',
        userGroups: ['contentApproverGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    }
};
