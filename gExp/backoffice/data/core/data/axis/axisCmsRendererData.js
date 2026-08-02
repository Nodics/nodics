/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsRendererData
 * @description Maps Axis content types to trusted logical renderer keys.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record0: { code: 'axisAuthenticationPageType', renderer: 'axis.page.authentication', contractVersion: 1, active: true },
    record1: { code: 'axisDashboardPageType', renderer: 'axis.page.dashboard', contractVersion: 1, active: true },
    record2: { code: 'axisBrandComponentType', renderer: 'axis.component.brand', contractVersion: 1, active: true },
    record3: { code: 'axisMessageComponentType', renderer: 'axis.component.message', contractVersion: 1, active: true },
    record4: { code: 'axisEmployeeLoginFormComponentType', renderer: 'axis.component.employee-login-form', contractVersion: 1, active: true },
    record5: { code: 'axisEmployeeRecoveryFormComponentType', renderer: 'axis.component.employee-recovery-form', contractVersion: 1, active: true },
    record6: { code: 'axisLinkComponentType', renderer: 'axis.component.link', contractVersion: 1, active: true },
    record7: { code: 'axisDashboardSummaryComponentType', renderer: 'axis.component.dashboard-summary', contractVersion: 1, active: true },
    record8: { code: 'axisDashboardActionsComponentType', renderer: 'axis.component.dashboard-actions', contractVersion: 1, active: true },
    record9: { code: 'axisAuthenticationShowcaseComponentType', renderer: 'axis.component.authentication-showcase',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record10: { code: 'axisEmployeeLockFormComponentType', renderer: 'axis.component.employee-lock-form',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record11: { code: 'axisAssistantPageType', renderer: 'axis.page.assistant',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record12: { code: 'axisAssistantWorkspaceComponentType', renderer: 'axis.component.assistant-workspace',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record13: { code: 'axisSchemaWorkbenchPageType', renderer: 'axis.page.schema-workbench',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record14: { code: 'axisSchemaWorkbenchComponentType', renderer: 'axis.component.schema-workbench',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record15: { code: 'axisMediaManagementPageType', renderer: 'axis.page.media-management',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true },
    record16: { code: 'axisMediaManagementWorkspaceComponentType', renderer: 'axis.component.media-management-workspace',
        contractVersion: 1, channels: ['web', 'mobile-webview'], deprecated: false, active: true }
};
