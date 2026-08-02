/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsSlotData
 * @description Defines stable slots for the initial Axis authentication and dashboard templates.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record11: { code: 'axisAuthenticationShowcaseSlot', template: 'axisAuthenticationPageTemplate', name: 'showcase',
        minItems: 1, maxItems: 1, allowedComponentTypes: ['axisAuthenticationShowcaseComponentType'], active: true },
    record0: { code: 'axisAuthenticationBrandSlot', template: 'axisAuthenticationPageTemplate', name: 'brand', minItems: 1, maxItems: 1, allowedComponentTypes: ['axisBrandComponentType'], active: true },
    record1: { code: 'axisAuthenticationIntroductionSlot', template: 'axisAuthenticationPageTemplate', name: 'introduction', minItems: 1, maxItems: 2, allowedComponentTypes: ['axisMessageComponentType'], active: true },
    record2: { code: 'axisAuthenticationFormSlot', template: 'axisAuthenticationPageTemplate', name: 'authentication', minItems: 1, maxItems: 1,
        allowedComponentTypes: ['axisEmployeeLoginFormComponentType', 'axisEmployeeRecoveryFormComponentType', 'axisEmployeeLockFormComponentType'], active: true },
    record3: { code: 'axisAuthenticationAssistanceSlot', template: 'axisAuthenticationPageTemplate', name: 'assistance', minItems: 0, maxItems: 3, allowedComponentTypes: ['axisLinkComponentType', 'axisMessageComponentType'], active: true },
    record4: { code: 'axisAuthenticationLegalSlot', template: 'axisAuthenticationPageTemplate', name: 'legal', minItems: 0, maxItems: 3, allowedComponentTypes: ['axisLinkComponentType', 'axisMessageComponentType'], active: true },
    record6: { code: 'axisDashboardWelcomeSlot', template: 'axisDashboardPageTemplate', name: 'welcome', minItems: 1, maxItems: 1, allowedComponentTypes: ['axisMessageComponentType'], active: true },
    record7: { code: 'axisDashboardSummarySlot', template: 'axisDashboardPageTemplate', name: 'summary', minItems: 1, maxItems: 1, allowedComponentTypes: ['axisDashboardSummaryComponentType'], active: true },
    record8: { code: 'axisDashboardActionsSlot', template: 'axisDashboardPageTemplate', name: 'quickActions', minItems: 1, maxItems: 1, allowedComponentTypes: ['axisDashboardActionsComponentType'], active: true },
    record9: { code: 'axisDashboardActivitySlot', template: 'axisDashboardPageTemplate', name: 'activity', minItems: 0, maxItems: 1, allowedComponentTypes: ['axisMessageComponentType'], active: true },
    record10: { code: 'axisDashboardHelpSlot', template: 'axisDashboardPageTemplate', name: 'help', minItems: 0, maxItems: 2, allowedComponentTypes: ['axisMessageComponentType', 'axisLinkComponentType'], active: true },
    record12: { code: 'axisAssistantHeaderSlot', template: 'axisAssistantPageTemplate', name: 'header',
        minItems: 1, maxItems: 2, allowedComponentTypes: ['axisBrandComponentType', 'axisMessageComponentType'], active: true },
    record13: { code: 'axisAssistantWorkspaceSlot', template: 'axisAssistantPageTemplate', name: 'workspace',
        minItems: 1, maxItems: 1, allowedComponentTypes: ['axisAssistantWorkspaceComponentType'], active: true },
    record14: { code: 'axisSchemaWorkbenchHeaderSlot', template: 'axisSchemaWorkbenchPageTemplate', name: 'header',
        minItems: 1, maxItems: 1, allowedComponentTypes: ['axisBrandComponentType'], active: true },
    record15: { code: 'axisSchemaWorkbenchContentSlot', template: 'axisSchemaWorkbenchPageTemplate', name: 'content',
        minItems: 1, maxItems: 1, allowedComponentTypes: ['axisSchemaWorkbenchComponentType'], active: true },
    record16: { code: 'axisMediaManagementWorkspaceSlot', template: 'axisMediaManagementPageTemplate', name: 'workspace',
        minItems: 1, maxItems: 1, allowedComponentTypes: ['axisMediaManagementWorkspaceComponentType'], active: true }
};
