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
const testSuites = require('../config/properties').tooling.testSuites || {};

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

function suiteTokens(suiteName, stack = []) {
    const suite = testSuites[suiteName];
    assert(suite, 'Missing configured test suite: ' + suiteName);
    assert(!stack.includes(suiteName), 'Circular configured test suite reference: ' + stack.concat(suiteName).join(' -> '));
    return suite.reduce((tokens, step) => {
        if (step.suite) {
            return tokens.concat('suite:' + step.suite, suiteTokens(step.suite, stack.concat(suiteName)));
        }
        if (step.npm) {
            return tokens.concat(step.npm, step.args || []);
        }
        if (step.node) {
            return tokens.concat(step.node, step.args || []);
        }
        if (step.tool) {
            return tokens.concat(step.tool, step.args || []);
        }
        return tokens.concat(JSON.stringify(step));
    }, []);
}

function requireSuiteIncludes(suiteName, expectedFragments) {
    const tokens = suiteTokens(suiteName);
    expectedFragments.forEach(fragment => {
        assert(
            tokens.some(token => token.includes(fragment)),
            suiteName + ' suite must include `' + fragment + '` so full-suite coverage remains wired'
        );
    });
}

function requireFile(relativePath) {
    assert(
        fs.existsSync(path.join(repositoryRoot, relativePath)),
        'Missing full-suite coverage file: ' + relativePath
    );
}

requireScriptIncludes('test:basic', ['test:suite --suite=basic']);
requireScriptIncludes('test:full', ['test:suite --suite=full']);
requireScriptIncludes('test:import', ['test:suite --suite=import']);
requireScriptIncludes('release:check', ['release:check']);

requireSuiteIncludes('basic', [
    'suite:import',
    'suite:cronjob',
    'suite:ems',
    'suite:workflow',
    'topology-consolidated'
]);

requireSuiteIncludes('full', [
    'basic',
    'topology-modular'
]);

requireSuiteIncludes('import', [
    'importTenantPrecedence.test.js',
    'testTenantImportIsolation.test.js',
    'importLifecycleContract.test.js',
    'remoteImportTransportGovernance.test.js',
    'remoteImportInitializerContract.test.js',
    'importGovernanceLifecycleContract.test.js',
    'importExportAccessPolicy.test.js'
]);

requireSuiteIncludes('workflow', [
    'workflowServicePipelineContract.test.js',
    'workflowActionPerformEngineContract.test.js',
    'workflowEngineCorrectnessContract.test.js',
    'workflowSplitAndRetryContract.test.js',
    'workflowEventContinuationContract.test.js',
    'workflowLifecyclePipelineContract.test.js'
]);

requireSuiteIncludes('cronjob', [
    'cronJobServiceLifecycleContract.test.js',
    'cronJobRuntimeContainerContract.test.js',
    'cronJobEventHandlerContract.test.js'
]);

requireSuiteIncludes('ems', [
    'emsClientRouteContract.test.js',
    'messageTenantResolution.test.js',
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
    'gFramework/nTooling/test/dependencyOwnershipContract.test.js',
    'gFramework/nTooling/test/releaseCheckCommandContract.test.js',
    'gCore/workflow/flowCore/test/workflowEventContinuationContract.test.js',
    'gCore/workflow/flowCore/test/workflowSplitAndRetryContract.test.js',
    'gCore/cronjob/test/cronJobRuntimeContainerContract.test.js',
    'gCore/cronjob/test/cronJobEventHandlerContract.test.js',
    'gFramework/nEms/emsClient/test/messageTenantResolution.test.js',
    'gFramework/nEms/emsClient/test/emsMessageProcessContract.test.js',
    'startio/envs/startioLocal/test/topology/startioLocalRuntimeTopology.test.js',
    'startio/envs/startioLocal/test/topology/runtimeContractProbe.js'
].forEach(requireFile);

console.log('Full test suite coverage contract validated');
