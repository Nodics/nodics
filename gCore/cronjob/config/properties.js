/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/config/properties
 * @description Cronjob runtime properties for node responsibility handlers, startup activation, retry timing, and default error codes.
 * @layer config
 * @owner cronjob
 * @override Project, environment, server, or node layers may override cronjob scheduling behavior without changing framework defaults.
 */
module.exports = {
    backofficeCapabilities: {
        cronjob: {
            enabled: true, capabilityId: 'job-scheduling', displayName: 'Scheduled Jobs', category: 'operations', icon: 'schedule',
            contractVersion: 1, minimumClientContractVersion: 1, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['cronjob.backoffice.view'],
            navigation: [{ id: 'cronjob', label: 'Scheduled Jobs', route: '/jobs', icon: 'cronjob', order: 300,
                group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant'],
                featureState: 'ACTIVE', requiredPermissions: ['cronjob.backoffice.view'] },
            { id: 'job-triggers', label: 'Triggers', route: '/jobs/triggers', icon: 'cronjob',
                order: 310, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant'],
                featureState: 'DISABLED' },
            { id: 'job-execution-history', label: 'Execution History', route: '/jobs/history', icon: 'cronjob',
                order: 320, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant'],
                featureState: 'DISABLED' },
            { id: 'job-failures', label: 'Job Failures', route: '/jobs/failures', icon: 'cronjob',
                order: 330, group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant'],
                featureState: 'DISABLED' }]
        }
    },

    nodePingableModules: {
        cronjob: {
            enabled: false,
            nodeUpHandler: 'defaultCronJobNodeUpHandlerPipeline',
            nodeDownHandler: 'defaultCronJobNodeDownHandlerPipeline'
        }
    },

    cronjob: {
        runOnStartup: false,
        waitTime: 1000,
    },

    defaultErrorCodes: {
        CronJobError: 'ERR_JOB_00000'
    }
};
