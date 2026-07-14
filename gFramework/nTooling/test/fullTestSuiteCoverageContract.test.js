/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/fullTestSuiteCoverageContract
 * @description Guards the full Nodics test command surface so import,
 * workflow, cron, NEMS, tenant, and distributed-communication coverage remains
 * wired into executable package gates instead of living only as documentation.
 * @layer test
 * @owner nTooling
 * @override Projects may add stricter release suites, but must preserve these
 * framework-owned capability and topology gates unless a reviewed replacement
 * provides equivalent coverage.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');
const scripts = require(path.join(repositoryRoot, 'package.json')).scripts || {};

function requireScript(scriptName) {
    assert(scripts[scriptName], 'Missing npm script: ' + scriptName);
    return scripts[scriptName];
}

function requireScriptIncludes(scriptName, expectedFragments) {
    const script = requireScript(scriptName);
    expectedFragments.forEach(fragment => {
        assert(
            script.includes(fragment),
            scriptName + ' must include `' + fragment + '` so full-suite coverage remains wired'
        );
    });
}

function requireFile(relativePath) {
    assert(
        fs.existsSync(path.join(repositoryRoot, relativePath)),
        'Missing full-suite coverage file: ' + relativePath
    );
}

requireScriptIncludes('test:basic', [
    'test:import',
    'test:cronjob',
    'test:ems',
    'test:workflow',
    'test:topology:consolidated'
]);

requireScriptIncludes('test:full', [
    'test:basic',
    'test:topology:modular'
]);

requireScriptIncludes('test:import', [
    'test:import-tenant-precedence',
    'test:import-test-tenant-isolation',
    'test:import-lifecycle',
    'test:remote-import-transport',
    'test:import-governance-lifecycle',
    'test:import-export-access-policy'
]);

requireScriptIncludes('test:workflow', [
    'workflowServicePipelineContract.test.js',
    'workflowActionPerformEngineContract.test.js',
    'workflowEngineCorrectnessContract.test.js',
    'workflowSplitAndRetryContract.test.js',
    'workflowEventContinuationContract.test.js',
    'workflowLifecyclePipelineContract.test.js'
]);

requireScriptIncludes('test:cronjob', [
    'cronJobServiceLifecycleContract.test.js',
    'cronJobRuntimeContainerContract.test.js',
    'cronJobEventHandlerContract.test.js'
]);

requireScriptIncludes('test:ems', [
    'test:ems-client-routes',
    'test:ems-message-tenant',
    'emsClientServiceContract.test.js',
    'emsMessageProcessContract.test.js'
]);

[
    'test:basic:report',
    'test:full:report',
    'test:import:report',
    'test:topology:consolidated:report',
    'test:topology:modular:report'
].forEach(scriptName => {
    requireScriptIncludes(scriptName, ['test:report']);
});

[
    'gFramework/nData/nImport/import/test/importTenantPrecedence.test.js',
    'gFramework/nData/nImport/import/test/testTenantImportIsolation.test.js',
    'gFramework/nData/nImport/import/test/importGovernanceLifecycleContract.test.js',
    'gCore/workflow/flowCore/test/workflowEventContinuationContract.test.js',
    'gCore/workflow/flowCore/test/workflowSplitAndRetryContract.test.js',
    'gCore/cronjob/test/cronJobRuntimeContainerContract.test.js',
    'gCore/cronjob/test/cronJobEventHandlerContract.test.js',
    'gFramework/nEms/emsClient/test/messageTenantResolution.test.js',
    'gFramework/nEms/emsClient/test/emsMessageProcessContract.test.js',
    'kickoff/test/topology/kickoffLocalRuntimeTopology.test.js',
    'kickoff/test/topology/runtimeContractProbe.js'
].forEach(requireFile);

console.log('Full test suite coverage contract validated');
