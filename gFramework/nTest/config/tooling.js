/**
 * @module nTest/config/tooling
 * @description Contributes project-aware test discovery, execution, live-safety, and reporting commands to the non-runtime Nodics tooling registry.
 * @layer config
 * @owner nTest
 * @override Later project modules may extend test commands or explicitly replace handlers and scripts.
 */
module.exports = {
    commands: {
        'test:report': {
            description: 'Run a Nodics test command and write a structured test report.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/runTestSuiteWithReport.js'
        },
        'test:route-contracts': {
            description: 'Discover and execute module-owned route contract tests.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/runRouteContractTests.js'
        },
        'test:generated': {
            description: 'Discover and execute generated tests with optional type filtering.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/runGeneratedTests.js'
        },
        'test:generated:crud:live': {
            description: 'Execute explicitly enabled generated destructive CRUD tests.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/runGeneratedCrudLiveTests.js'
        },
        'test:access-policy:live': {
            description: 'Execute generated live access-policy tests or validate their dry-run contract.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/runGeneratedAccessPolicyLiveTests.js'
        },
        'test:capability-behavior': {
            description: 'Discover and execute marked capability behavior tests.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/runCapabilityBehaviorTests.js'
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
};
