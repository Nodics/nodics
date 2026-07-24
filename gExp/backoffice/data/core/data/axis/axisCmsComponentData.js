/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsComponentData
 * @description Provides client-safe content for initial Axis employee authentication and dashboard components.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record15: {
        code: 'axisAuthenticationShowcaseComponent', typeCode: 'axisAuthenticationShowcaseComponentType', accessMode: 'PUBLIC',
        properties: {
            eyebrow: 'Nodics enterprise operations',
            title: 'One governed workspace for every business capability.',
            message: 'Discover active modules, operate secure workflows, and keep every action inside its authoritative Nodics contract.',
            highlights: ['Employee-only access', 'Direct module connectivity', 'Contract-governed operations']
        },
        active: true
    },
    record0: {
        code: 'axisBrandComponent', typeCode: 'axisBrandComponentType', accessMode: 'PUBLIC',
        properties: { productName: 'Nodics Axis', tagline: 'Business operations, connected.', logoAsset: 'axis-brand-mark',
            displayMode: 'authentication' }, active: true
    },
    record1: {
        code: 'axisLoginIntroductionComponent', typeCode: 'axisMessageComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Welcome back', message: 'Sign in with your employee account to access Nodics Axis.', tone: 'default' }, active: true
    },
    record2: {
        code: 'axisEmployeeLoginFormComponent', typeCode: 'axisEmployeeLoginFormComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Employee sign in', usernameLabel: 'Username', usernamePlaceholder: 'Enter your username',
            passwordLabel: 'Password', passwordPlaceholder: 'Enter your password', submitLabel: 'Sign in' }, active: true
    },
    record3: {
        code: 'axisForgotPasswordLinkComponent', typeCode: 'axisLinkComponentType', accessMode: 'PUBLIC',
        properties: { label: 'Forgot password?', route: '/forgot-password' }, active: true
    },
    record4: {
        code: 'axisLoginSecurityComponent', typeCode: 'axisMessageComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Employee access only', message: 'Customer accounts cannot access this application.', tone: 'security' }, active: true
    },
    record5: {
        code: 'axisForgotPasswordIntroductionComponent', typeCode: 'axisMessageComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Recover employee access', message: 'Enter your employee account identifier to request recovery instructions.', tone: 'default' }, active: true
    },
    record6: {
        code: 'axisEmployeeRecoveryFormComponent', typeCode: 'axisEmployeeRecoveryFormComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Reset password', identifierLabel: 'Employee username or email',
            identifierPlaceholder: 'Enter your employee identifier', submitLabel: 'Send recovery instructions',
            successMessage: 'If the account is eligible, recovery instructions will be sent.' }, active: true
    },
    record7: {
        code: 'axisBackToLoginLinkComponent', typeCode: 'axisLinkComponentType', accessMode: 'PUBLIC',
        properties: { label: 'Back to sign in', route: '/login' }, active: true
    },
    record8: {
        code: 'axisLegalComponent', typeCode: 'axisMessageComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Authorized use', message: 'Use of Nodics Axis is limited to authorized employees.', tone: 'muted' }, active: true
    },
    record9: {
        code: 'axisDashboardHeaderComponent', typeCode: 'axisBrandComponentType', accessMode: 'AUTHENTICATED',
        properties: { productName: 'Nodics Axis', tagline: 'Employee BackOffice', logoAsset: 'axis-brand-mark' }, active: true
    },
    record10: {
        code: 'axisDashboardWelcomeComponent', typeCode: 'axisMessageComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Welcome to Nodics Axis', message: 'Your authorized business workspace is ready.', tone: 'default' }, active: true
    },
    record11: {
        code: 'axisDashboardSummaryComponent', typeCode: 'axisDashboardSummaryComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Business summary', items: [], placeholder: true }, active: true
    },
    record12: {
        code: 'axisDashboardActionsComponent', typeCode: 'axisDashboardActionsComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Quick actions', actions: [], placeholder: true }, active: true
    },
    record13: {
        code: 'axisDashboardActivityComponent', typeCode: 'axisMessageComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Recent activity', message: 'Operational activity will appear here when module integrations are enabled.', tone: 'muted' }, active: true
    },
    record14: {
        code: 'axisDashboardHelpComponent', typeCode: 'axisMessageComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Getting started', message: 'Select an authorized business module from the Axis navigation.', tone: 'information' }, active: true
    },
    record16: {
        code: 'axisLockShowcaseComponent', typeCode: 'axisAuthenticationShowcaseComponentType', accessMode: 'AUTHENTICATED',
        properties: {
            eyebrow: 'Protected employee workspace',
            title: 'Your Axis workspace is locked, not signed out.',
            message: 'Re-enter your employee password to continue without exposing operational pages while you are away.',
            highlights: ['Session remains memory-only', 'Profile verifies every unlock', 'Sign out is always available']
        },
        active: true
    },
    record17: {
        code: 'axisLockBrandComponent', typeCode: 'axisBrandComponentType', accessMode: 'AUTHENTICATED',
        properties: { productName: 'Nodics Axis', tagline: 'Secure employee workspace', logoAsset: 'axis-brand-mark',
            displayMode: 'authentication' }, active: true
    },
    record18: {
        code: 'axisLockIntroductionComponent', typeCode: 'axisMessageComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Screen locked', message: 'Enter your password to unlock this employee session.', tone: 'default' }, active: true
    },
    record19: {
        code: 'axisEmployeeLockFormComponent', typeCode: 'axisEmployeeLockFormComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Unlock Axis', employeeLabel: 'Signed in as', passwordLabel: 'Password',
            passwordPlaceholder: 'Enter your password', submitLabel: 'Unlock', signOutLabel: 'Not you? Sign out' }, active: true
    },
    record20: {
        code: 'axisLockLegalComponent', typeCode: 'axisMessageComponentType', accessMode: 'AUTHENTICATED',
        properties: { title: 'Protected session', message: 'Unlock attempts are verified by the Profile authentication authority.', tone: 'muted' }, active: true
    }
};
