/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsPageData
 * @description Composes the initial Axis login, employee recovery, and employee dashboard pages.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record0: {
        code: 'axisLoginPage', name: 'Axis Employee Login', cmsSite: ['axisCmsSite'],
        typeCode: 'axisAuthenticationPageType', template: 'axisAuthenticationPageTemplate', renderer: 'axis.page.authentication',
        cmsComponents: [
            { target: 'axisAuthenticationShowcaseComponent', slot: 'showcase', index: 5, active: true },
            { target: 'axisBrandComponent', slot: 'brand', index: 10, active: true },
            { target: 'axisLoginIntroductionComponent', slot: 'introduction', index: 20, active: true },
            { target: 'axisEmployeeLoginFormComponent', slot: 'authentication', index: 30, active: true },
            { target: 'axisForgotPasswordLinkComponent', slot: 'assistance', index: 40, active: true },
            { target: 'axisLoginSecurityComponent', slot: 'assistance', index: 50, active: true },
            { target: 'axisLegalComponent', slot: 'legal', index: 60, active: true }
        ],
        active: true
    },
    record1: {
        code: 'axisForgotPasswordPage', name: 'Axis Employee Password Recovery', cmsSite: ['axisCmsSite'],
        typeCode: 'axisAuthenticationPageType', template: 'axisAuthenticationPageTemplate', renderer: 'axis.page.authentication',
        cmsComponents: [
            { target: 'axisAuthenticationShowcaseComponent', slot: 'showcase', index: 5, active: true },
            { target: 'axisBrandComponent', slot: 'brand', index: 10, active: true },
            { target: 'axisForgotPasswordIntroductionComponent', slot: 'introduction', index: 20, active: true },
            { target: 'axisEmployeeRecoveryFormComponent', slot: 'authentication', index: 30, active: true },
            { target: 'axisBackToLoginLinkComponent', slot: 'assistance', index: 40, active: true },
            { target: 'axisLegalComponent', slot: 'legal', index: 50, active: true }
        ],
        active: true
    },
    record2: {
        code: 'axisDashboardPage', name: 'Axis Employee Dashboard', cmsSite: ['axisCmsSite'],
        typeCode: 'axisDashboardPageType', template: 'axisDashboardPageTemplate', renderer: 'axis.page.dashboard',
        cmsComponents: [
            { target: 'axisDashboardHeaderComponent', slot: 'header', index: 10, active: true },
            { target: 'axisDashboardWelcomeComponent', slot: 'welcome', index: 20, active: true },
            { target: 'axisDashboardSummaryComponent', slot: 'summary', index: 30, active: true },
            { target: 'axisDashboardActionsComponent', slot: 'quickActions', index: 40, active: true },
            { target: 'axisDashboardActivityComponent', slot: 'activity', index: 50, active: true },
            { target: 'axisDashboardHelpComponent', slot: 'help', index: 60, active: true }
        ],
        active: true
    },
    record3: {
        code: 'axisLockScreenPage', name: 'Axis Employee Lock Screen', cmsSite: ['axisCmsSite'],
        typeCode: 'axisAuthenticationPageType', template: 'axisAuthenticationPageTemplate', renderer: 'axis.page.authentication',
        cmsComponents: [
            { target: 'axisLockShowcaseComponent', slot: 'showcase', index: 5, active: true },
            { target: 'axisLockBrandComponent', slot: 'brand', index: 10, active: true },
            { target: 'axisLockIntroductionComponent', slot: 'introduction', index: 20, active: true },
            { target: 'axisEmployeeLockFormComponent', slot: 'authentication', index: 30, active: true },
            { target: 'axisLockLegalComponent', slot: 'legal', index: 40, active: true }
        ],
        active: true
    }
};
