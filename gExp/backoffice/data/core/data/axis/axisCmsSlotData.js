/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
    record5: { code: 'axisDashboardHeaderSlot', template: 'axisDashboardPageTemplate', name: 'header', minItems: 1, maxItems: 2, allowedComponentTypes: ['axisBrandComponentType', 'axisMessageComponentType'], active: true },
    record6: { code: 'axisDashboardWelcomeSlot', template: 'axisDashboardPageTemplate', name: 'welcome', minItems: 1, maxItems: 1, allowedComponentTypes: ['axisMessageComponentType'], active: true },
    record7: { code: 'axisDashboardSummarySlot', template: 'axisDashboardPageTemplate', name: 'summary', minItems: 1, maxItems: 1, allowedComponentTypes: ['axisDashboardSummaryComponentType'], active: true },
    record8: { code: 'axisDashboardActionsSlot', template: 'axisDashboardPageTemplate', name: 'quickActions', minItems: 1, maxItems: 1, allowedComponentTypes: ['axisDashboardActionsComponentType'], active: true },
    record9: { code: 'axisDashboardActivitySlot', template: 'axisDashboardPageTemplate', name: 'activity', minItems: 0, maxItems: 1, allowedComponentTypes: ['axisMessageComponentType'], active: true },
    record10: { code: 'axisDashboardHelpSlot', template: 'axisDashboardPageTemplate', name: 'help', minItems: 0, maxItems: 2, allowedComponentTypes: ['axisMessageComponentType', 'axisLinkComponentType'], active: true }
};
