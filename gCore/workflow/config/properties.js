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
            navigation: [{ id: 'workflow', label: 'Workflows', route: '/workflows', icon: 'workflow', order: 400,
                group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'ACTIVE', requiredPermissions: ['workflow.backoffice.view'] },
            ...['Workflow Definitions', 'Workflow Instances', 'Workflow Actions', 'Workflow Failures',
                'Visual Workflow Designer', 'Agentic Processes'].map((label, index) => ({
                id: ['workflow-definitions', 'workflow-instances', 'workflow-actions',
                    'workflow-failures', 'workflow-designer', 'agentic-processes'][index],
                label, route: '/workflows/' + ['definitions', 'instances', 'actions', 'failures',
                    'designer', 'agentic-processes'][index], icon: 'workflow',
                order: 410 + index * 10,
                group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED'
            }))]
        }
    },
    workflow: {
        defaultEventType: 'SYNC',
        defaultSuccessHandler: 'DefaultWorkflowSuccessActionService.handleSuccessProcess',
        defaultErrorHandler: 'DefaultWorkflowErrorActionService.handleErrorProcess',

        itemErrorLimit: 3
    }
};
