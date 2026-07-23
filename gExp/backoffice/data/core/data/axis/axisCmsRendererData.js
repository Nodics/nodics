/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
    record8: { code: 'axisDashboardActionsComponentType', renderer: 'axis.component.dashboard-actions', contractVersion: 1, active: true }
};
