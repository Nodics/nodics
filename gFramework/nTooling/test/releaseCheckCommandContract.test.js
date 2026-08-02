/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/ReleaseCheckCommandContract
 * @description Verifies the clean-checkout release gate is configured,
 * dry-runnable, and executable through governed nTooling command contracts.
 * @layer test
 * @owner nTooling
 * @override Project release gates may add stricter steps, but must preserve a
 * dry-run plan and explicit execution flag.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');
const packageJson = require(path.join(repositoryRoot, 'package.json'));
const toolingProperties = require('../config/properties');
const releaseCheck = require('../src/service/command/defaultReleaseCheckCommandService');
const command = toolingProperties.tooling.commands['release:check'];
const cleanCommand = toolingProperties.tooling.commands.clean;
const buildCommand = toolingProperties.tooling.commands.build;
const basicSuite = toolingProperties.tooling.testSuites.basic;
const generatedSuite = toolingProperties.tooling.testSuites.generated;

assert(packageJson.scripts['release:check'], 'Root package.json must expose release:check');
assert.strictEqual(command.handler, 'src/service/command/defaultReleaseCheckCommandService.js');

const workflowPath = path.join(repositoryRoot, '.github/workflows/release-check.yml');
assert(fs.existsSync(workflowPath), 'GitHub Actions must expose the Nodics release-check workflow');

const workflowSource = fs.readFileSync(workflowPath, 'utf8');
assert(workflowSource.includes('actions/checkout@v4'), 'Release workflow must checkout a clean repository');
assert(workflowSource.includes('actions/setup-node@v4'), 'Release workflow must provision governed Node runtimes');
assert(workflowSource.includes('22.x'), 'Release workflow must prove the supported Node 22 line');
assert(workflowSource.includes('24.x'), 'Release workflow must prove the preferred Node 24 line');
assert(workflowSource.includes('npm run release:check'), 'Release workflow must print the governed release gate');
assert(workflowSource.includes('npm run release:check -- --execute'),
    'Release workflow must execute the governed release gate instead of duplicating steps');
assert(workflowSource.includes('npm run release:check -- --execute --full'),
    'Release workflow must expose full release-candidate validation through the same command authority');
assert(workflowSource.includes('development') && workflowSource.includes('master'),
    'Release workflow must protect development and master branches');

const context = {
    home: repositoryRoot,
    args: [],
    command: command
};
const dryPlan = releaseCheck.createPlan(context);
const dryLabels = dryPlan.map(step => releaseCheck.normalizeStep(step).label);
assert.deepStrictEqual(dryLabels, [
    'npm ci',
    'npm audit --omit=dev',
    'npm run clean',
    'npm run build',
    'npm run llm:validate',
    'npm run quality:docs',
    'npm run test:basic'
]);
assert.strictEqual(dryLabels[0], 'npm ci',
    'Clean-checkout release validation must install dependencies before any command can use local node_modules');
assert(dryLabels.indexOf('npm ci') < dryLabels.indexOf('npm audit --omit=dev'),
    'Release validation must install exactly from the lockfile before auditing runtime dependencies');
assert(dryLabels.indexOf('npm audit --omit=dev') < dryLabels.indexOf('npm run clean'),
    'Release validation must fail fast on runtime dependency advisories before source/build validation');
assert(dryLabels.indexOf('npm run clean') < dryLabels.indexOf('npm run build'),
    'Release validation must remove previous generated/build output before rebuilding it');
assert(dryLabels.indexOf('npm run build') < dryLabels.indexOf('npm run llm:validate'),
    'Release validation must regenerate generated artifacts before validating generated LLM context');
assert(dryLabels.indexOf('npm run build') < dryLabels.indexOf('npm run test:basic'),
    'Release validation must regenerate generated tests before any basic test suite executes them');

assert.deepStrictEqual(cleanCommand.steps, [
    { tool: ['llm:clean'] },
    { nodicsMethod: 'cleanAll' }
], 'Clean command must remove generated LLM context and generated runtime/test/build output before release build');

const buildStepLabels = buildCommand.steps.map(step => {
    if (step.tool) return 'tool:' + step.tool.join(' ');
    if (step.nodicsMethod) return 'nodicsMethod:' + step.nodicsMethod;
    return JSON.stringify(step);
});
assert(buildStepLabels.includes('nodicsMethod:buildAll'),
    'Build command must regenerate schema-driven runtime and generated test artifacts');
assert(buildStepLabels.includes('tool:docs:openapi'),
    'Build command must regenerate OpenAPI contracts instead of relying on previous output');
assert(buildStepLabels.includes('tool:llm:generate'),
    'Build command must regenerate module LLM context before release validation');
assert(buildStepLabels.indexOf('nodicsMethod:buildAll') < buildStepLabels.indexOf('tool:llm:generate'),
    'Generated runtime/test artifacts must be rebuilt before LLM context snapshots are regenerated');
assert(buildStepLabels.indexOf('tool:llm:generate') < buildStepLabels.indexOf('tool:docs:coverage --scope=generated --fail'),
    'Generated documentation coverage must inspect freshly regenerated LLM context');
assert(basicSuite.some(step => step.suite === 'generated'),
    'Basic test suite must execute generated tests after the release build regenerates them');
assert(generatedSuite.some(step => step.node === 'gFramework/nTest/test/generatedTestRunnerLifecycleContract.test.js'),
    'Generated suite must prove missing generated artifacts fail instead of passing');
assert(generatedSuite.findIndex(step => step.node === 'gFramework/nTest/test/generatedTestRunnerLifecycleContract.test.js')
    < generatedSuite.findIndex(step => step.tool && step.tool[0] === 'test:generated'),
    'Generated-test lifecycle guard must run before generated tests are executed');

const fullPlan = releaseCheck.createPlan(Object.assign({}, context, {
    args: ['--full']
}));
assert.strictEqual(releaseCheck.normalizeStep(fullPlan[fullPlan.length - 1]).label, 'npm run test:full',
    'Full release validation must include test:full');

let printed = [];
const originalLog = console.log;
console.log = function (message) {
    printed.push(message);
};
try {
    releaseCheck.run(context);
} finally {
    console.log = originalLog;
}
assert(printed.some(line => String(line).includes('Nodics clean-checkout release gate')),
    'Dry run must print a release gate heading');
assert(printed.some(line => String(line).includes('Run with --execute')),
    'Dry run must explain explicit execution');

let executed = [];
const originalExecuteStep = releaseCheck.executeStep;
releaseCheck.executeStep = function (runContext, step) {
    executed.push(this.normalizeStep(step).label);
};
try {
    releaseCheck.run(Object.assign({}, context, {
        args: ['--execute']
    }));
} finally {
    releaseCheck.executeStep = originalExecuteStep;
}
assert.deepStrictEqual(executed, dryPlan.map(step => releaseCheck.normalizeStep(step).label),
    'Execution must run the configured gate in order');

console.log('Release check command contract validated');
