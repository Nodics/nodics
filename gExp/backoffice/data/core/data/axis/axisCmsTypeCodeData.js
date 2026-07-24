/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsTypeCodeData
 * @description Declares non-executable Axis page and component property contracts.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record0: { code: 'axisAuthenticationPageType', kind: 'PAGE', contractVersion: 1, active: true },
    record1: { code: 'axisDashboardPageType', kind: 'PAGE', contractVersion: 1, active: true },
    record2: {
        code: 'axisBrandComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { productName: 'string', tagline: 'string', logoAsset: 'string', displayMode: 'string' },
        active: true
    },
    record3: {
        code: 'axisMessageComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', message: 'string', tone: 'string' },
        active: true
    },
    record4: {
        code: 'axisEmployeeLoginFormComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', usernameLabel: 'string', usernamePlaceholder: 'string',
            passwordLabel: 'string', passwordPlaceholder: 'string', submitLabel: 'string' },
        active: true
    },
    record5: {
        code: 'axisEmployeeRecoveryFormComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', identifierLabel: 'string', identifierPlaceholder: 'string',
            submitLabel: 'string', successMessage: 'string' },
        active: true
    },
    record6: {
        code: 'axisLinkComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { label: 'string', route: 'string' },
        active: true
    },
    record7: {
        code: 'axisDashboardSummaryComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', items: 'array', placeholder: 'boolean' },
        active: true
    },
    record8: {
        code: 'axisDashboardActionsComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', actions: 'array', placeholder: 'boolean' },
        active: true
    },
    record9: {
        code: 'axisAuthenticationShowcaseComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { eyebrow: 'string', title: 'string', message: 'string', highlights: 'array' },
        active: true
    },
    record10: {
        code: 'axisEmployeeLockFormComponentType',
        kind: 'COMPONENT',
        contractVersion: 1,
        propertySchema: { title: 'string', employeeLabel: 'string', passwordLabel: 'string',
            passwordPlaceholder: 'string', submitLabel: 'string', signOutLabel: 'string' },
        active: true
    }
};
