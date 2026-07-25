/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
            ...['Triggers', 'Execution History', 'Job Failures'].map((label, index) => ({
                id: ['job-triggers', 'job-execution-history', 'job-failures'][index],
                label, route: '/jobs/' + ['triggers', 'history', 'failures'][index], icon: 'cronjob',
                order: 310 + index * 10,
                group: { id: 'automation', label: 'Process and Automation', order: 500 },
                perspectives: ['operations'], contexts: ['environment', 'tenant'],
                featureState: 'DISABLED'
            }))]
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
