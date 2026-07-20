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
            navigation: [{ id: 'cronjob', label: 'Scheduled Jobs', route: '/jobs', order: 300, requiredPermissions: ['cronjob.backoffice.view'] }]
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
