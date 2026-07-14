/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDynamo/config/properties
 * @description Defines default nDynamo configuration used during module startup and layering.
 * @layer config
 * @owner nDynamo
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    schemaAccessPolicy: {
        policyTenant: 'default'
    },
    runtimePropertyGovernance: {
        sensitivePathPatterns: [
            'password',
            'passwd',
            'secret',
            'token',
            'api[-_]?key',
            'private[-_]?key',
            'credential'
        ]
    },
    tooling: {
        commands: {
            'governance:report': {
                description: 'Generate effective runtime configuration governance and override reports.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultGovernanceReportGeneratorService.js'
            }
        }
    }
};
