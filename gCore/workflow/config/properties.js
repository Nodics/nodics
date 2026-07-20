/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/config/properties
 * @description Defines default workflow configuration used during module startup and layering.
 * @layer config
 * @owner workflow
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    backofficeCapabilities: {
        workflow: {
            enabled: true, capabilityId: 'workflow-management', displayName: 'Workflows', category: 'operations', icon: 'workflow',
            contractVersion: 1, minimumClientContractVersion: 1, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['workflow.backoffice.view'],
            navigation: [{ id: 'workflow', label: 'Workflows', route: '/workflows', order: 400, requiredPermissions: ['workflow.backoffice.view'] }]
        }
    },
    workflow: {
        defaultEventType: 'SYNC',
        defaultSuccessHandler: 'DefaultWorkflowSuccessActionService.handleSuccessProcess',
        defaultErrorHandler: 'DefaultWorkflowErrorActionService.handleErrorProcess',

        itemErrorLimit: 3
    }
};
