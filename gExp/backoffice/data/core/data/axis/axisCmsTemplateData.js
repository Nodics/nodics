/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsTemplateData
 * @description Defines the initial Axis authentication and secured dashboard page templates.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record0: {
        code: 'axisAuthenticationPageTemplate',
        name: 'Axis Authentication Page',
        renderer: 'axis.template.authentication',
        contractVersion: 1,
        slots: ['axisAuthenticationShowcaseSlot', 'axisAuthenticationBrandSlot', 'axisAuthenticationIntroductionSlot', 'axisAuthenticationFormSlot',
            'axisAuthenticationAssistanceSlot', 'axisAuthenticationLegalSlot'],
        active: true
    },
    record1: {
        code: 'axisDashboardPageTemplate',
        name: 'Axis Dashboard Page',
        renderer: 'axis.template.dashboard',
        contractVersion: 1,
        slots: ['axisDashboardWelcomeSlot', 'axisDashboardSummarySlot',
            'axisDashboardActionsSlot', 'axisDashboardActivitySlot', 'axisDashboardHelpSlot'],
        active: true
    },
    record2: {
        code: 'axisAssistantPageTemplate', name: 'Axis Assistant Workspace',
        renderer: 'axis.template.assistant', contractVersion: 1,
        slots: ['axisAssistantHeaderSlot', 'axisAssistantWorkspaceSlot'], active: true
    },
    record3: {
        code: 'axisSchemaWorkbenchPageTemplate', name: 'Axis Schema Workbench',
        renderer: 'axis.template.schema-workbench', contractVersion: 1,
        slots: ['axisSchemaWorkbenchHeaderSlot', 'axisSchemaWorkbenchContentSlot'], active: true
    },
    record4: {
        code: 'axisMediaManagementPageTemplate', name: 'Axis Media Management',
        renderer: 'axis.template.media-management', contractVersion: 1,
        slots: ['axisMediaManagementWorkspaceSlot'], active: true
    }
};
