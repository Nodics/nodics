/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTest/config/properties
 * @description Default test execution settings for unit tests, Nodics tests, and layered test discovery.
 * @layer config
 * @owner nTest
 * @override Project, environment, server, or node layers may override test activation and discovery paths.
 */
module.exports = {
    test: {
        enabled: false,
        layeredDiscovery: {
            enabled: true,
            paths: []
        },
        uTest: {
            enabled: true,
            runOnStartup: true
        },
        nTest: {
            enabled: true,
            runOnStartup: true
        }
    },
    tooling: {
        commands: {
            'test:report': {
                description: 'Run a Nodics test command and write a structured test report.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultTestSuiteReportRunnerService.js'
            },
            'test:route-contracts': {
                description: 'Discover and execute module-owned route contract tests.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultRouteContractTestRunnerService.js'
            },
            'test:generated': {
                description: 'Discover and execute generated tests with optional type filtering.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultGeneratedTestRunnerService.js'
            },
            'test:generated:crud:live': {
                description: 'Execute explicitly enabled generated destructive CRUD tests.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultGeneratedCrudLiveTestRunnerService.js'
            },
            'test:access-policy:live': {
                description: 'Execute generated live access-policy tests or validate their dry-run contract.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultGeneratedAccessPolicyLiveTestRunnerService.js'
            },
            'test:capability-behavior': {
                description: 'Discover and execute marked capability behavior tests.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultCapabilityBehaviorTestRunnerService.js'
            },
            'test:live-tenant-guard': {
                description: 'Validate live-test protected-tenant guard behavior.',
                handler: '@nTooling/node-script',
                script: 'test/liveTestTenantGuard.test.js'
            },
            'test:suite-reporter': {
                description: 'Validate test-suite report parsing and construction.',
                handler: '@nTooling/node-script',
                script: 'test/testSuiteReporter.test.js'
            }
        }
    }
};
