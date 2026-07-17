/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
