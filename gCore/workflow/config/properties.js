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
            { id: 'workflow-definitions', label: 'Workflow Definitions', route: '/workflows/definitions',
                icon: 'workflow', order: 410, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'workflow-instances', label: 'Workflow Instances', route: '/workflows/instances',
                icon: 'workflow', order: 420, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'workflow-actions', label: 'Workflow Actions', route: '/workflows/actions',
                icon: 'workflow', order: 430, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'workflow-failures', label: 'Workflow Failures', route: '/workflows/failures',
                icon: 'workflow', order: 440, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'workflow-designer', label: 'Visual Workflow Designer', route: '/workflows/designer',
                icon: 'workflow', order: 450, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'agentic-processes', label: 'Agentic Processes', route: '/workflows/agentic-processes',
                icon: 'workflow', order: 460, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' }]
        }
    },
    workflow: {
        defaultEventType: 'SYNC',
        defaultSuccessHandler: 'DefaultWorkflowSuccessActionService.handleSuccessProcess',
        defaultErrorHandler: 'DefaultWorkflowErrorActionService.handleErrorProcess',

        itemErrorLimit: 3
    }
};
