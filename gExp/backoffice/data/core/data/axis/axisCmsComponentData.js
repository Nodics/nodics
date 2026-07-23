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
    record0: {
        code: 'axisBrandComponent', typeCode: 'axisBrandComponentType', accessMode: 'PUBLIC',
        properties: { productName: 'Nodics Axis', tagline: 'Business operations, connected.', logoAsset: 'axis-brand-mark' }, active: true
    },
    record1: {
        code: 'axisLoginIntroductionComponent', typeCode: 'axisMessageComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Welcome back', message: 'Sign in with your employee account to access Nodics Axis.', tone: 'default' }, active: true
    },
    record2: {
        code: 'axisEmployeeLoginFormComponent', typeCode: 'axisEmployeeLoginFormComponentType', accessMode: 'PUBLIC',
        properties: { title: 'Employee sign in', usernameLabel: 'Username', passwordLabel: 'Password', submitLabel: 'Sign in' }, active: true
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
        properties: { title: 'Forgot password', identifierLabel: 'Employee username or email', submitLabel: 'Send instructions',
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
    }
};
