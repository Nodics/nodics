/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
const authSecurity = require('../../../../../../gFramework/nAuth/src/service/security/defaultAuthSecurityService');
const bootstrapConfig = typeof CONFIG !== 'undefined' ? CONFIG : { get: function () { return undefined; } };
const bootstrapIdentity = authSecurity.validateBootstrapIdentity(bootstrapConfig);

/**
 * @module gCore/profile/data/init/data/user/defaultEmployeeData
 * @description Provides mandatory profile initializer employees using validated
 * bootstrap identity credentials from layered configuration.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
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
            password: bootstrapIdentity.adminPassword,
            active: true
        },
        principalType: 'human',
        userGroups: ['adminGroup', 'runtimeConfigAdminUserGroup'],
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
            password: bootstrapIdentity.servicePassword,
            active: true
        },
        apiKey: bootstrapIdentity.serviceApiKey,
        apiKeyScopes: ['auth.internal.token.read', 'auth.internal.token.read.anyTenant'],
        apiKeyStatus: 'active',
        identityMigrationVersion: 1,
        principalType: 'service',
        userGroups: ['serviceAccountUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record2: {
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
        userGroups: ['contentCreatorUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record3: {
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
        userGroups: ['contentApproverUserGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    }
};
